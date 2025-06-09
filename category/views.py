import json
import os
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from user.models import UserDiscount
from .serializers import *
from order.models import Order
from collections import defaultdict
from django.db import transaction


class PipeViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = PipeCreateUpdateSerializer
    permission_classes = [CustomAPIPermissions]
    public_methods = ["GET"]
    admin_only_methods = ["POST", "PUT", "DELETE"]

    def update_image_urls_recursively(self, base_url, data):
        """
        Update all image URLs in the data structure using a single recursive function
        that handles both updating and path construction in one pass.
        Recursively build category path (up to 2 levels) for products.s
        """

        def process_node(node, path_segments=None):
            if path_segments is None:
                path_segments = []

            if isinstance(node, dict):
                if "image" in node and node["image"]:
                    node["image"] = (
                        f"{base_url}{node['image']}"
                        if not node["image"].startswith("http")
                        else node["image"]
                    )

                # Add current name to path
                current_path = (
                    path_segments + [node["name"]] if "name" in node else path_segments
                )

                # Add category path to products
                if "product" in node and node["product"]:
                    trimmed_path = current_path[-2:]  # Use only last 2 levels
                    path_string = "   ➤   ".join(trimmed_path)
                    for product in node["product"]:
                        product["sub_category_full_name"] = path_string
                        # Update product image URL too
                        if "image" in product and product["image"]:
                            product["image"] = (
                                f"{base_url}{product['image']}"
                                if not product["image"].startswith("http")
                                else product["image"]
                            )
                        process_node(product, current_path)

                # Recurse into other dict fields
                for key, value in node.items():
                    if key not in ("image", "product"):
                        if key == "sub_categories":
                            process_node(value, current_path)
                        else:
                            process_node(value, current_path)

                # Apply discount if available
                if "image" in node:
                    node_id = node.get("id")
                    if node_id and isinstance(node_id, int):
                        discount_info = self.discount_data.get(node_id)
                        if discount_info:
                            node["discount_percent"] = discount_info["discount_percent"]
                            node["discount_type"] = discount_info["discount_type"]
                        else:
                            node["discount_percent"] = ""
                            node["discount_type"] = ""

            elif isinstance(node, list):
                for item in node:
                    process_node(item, path_segments.copy())

        process_node(data)
        return data

    def extract_keys(self, data):
        result = []

        # Case 1: List of dictionaries with 'name' and 'data'
        if isinstance(data, list) and isinstance(data[0], dict) and "data" in data[0]:
            for group in data:
                name = group["name"].replace(" ", "_").replace("mtrs", "Kg")
                keys = (
                    [k for k in group["data"][0].keys() if k != "id"]
                    if group["data"]
                    else []
                )
                result.append({"name": name, "key": keys})

        # Case 2: Direct list of dictionaries
        elif isinstance(data, list) and isinstance(data[0], dict):
            result = [k for k in data[0].keys() if k != "id"] if data else []

        return result

    def create_or_update_pipe(self, request, instance=None):
        is_update = instance is not None
        name = request.data.get("name")
        parent_id = request.data.get("parent")
        product = request.data.get("product")
        basic_data = request.data.get("basic_data")

        if not is_update:
            # On create: Check for duplicate pipe under the same parent
            existing_pipe_query = Pipe.objects.filter(name=name)
            if parent_id:
                existing_pipe_query = existing_pipe_query.filter(parent_id=parent_id)
            if product:
                existing_pipe_query = existing_pipe_query.filter(product_id=product)

            if existing_pipe_query.exists():
                return self.error_response(
                    "Pipe with this name already exists at this level"
                )

        # Use serializer to create or update
        serializer = PipeCreateUpdateSerializer(
            instance, data=request.data, partial=is_update
        )

        try:
            if serializer.is_valid(raise_exception=True):
                pipe = serializer.save()
                if basic_data:
                    # Create or update PipeDetail
                    if isinstance(basic_data, str):
                        try:
                            basic_data_parsed = json.loads(basic_data)
                        except json.JSONDecodeError:
                            basic_data_parsed = basic_data  # fallback or handle error
                    else:
                        basic_data_parsed = basic_data  # already a Python list/dict

                    PipeDetail.objects.update_or_create(
                        # pipe=parent_id if parent_id else product,
                        pipe=pipe,
                        defaults = {"basic_data": basic_data_parsed}
                    )

                    if is_update:
                        if pipe.parent:
                            if PipeKeyTemplate.objects.filter(
                                pipe=pipe.parent.id
                            ).exists():
                                pipe = pipe.parent
                        if pipe.product:
                            print(pipe.product, "pipe.product")
                            if PipeKeyTemplate.objects.filter(
                                pipe=pipe.product.id
                            ).exists():
                                pipe = pipe.product
                            elif PipeKeyTemplate.objects.filter(
                                pipe=pipe.product.parent.id
                            ).exists():
                                pipe = pipe.product.parent
                    else:
                        if pipe.parent:
                            pipe = pipe.parent
                        elif pipe.product:
                            pipe = pipe.product

                    # Create or update PipeKeyTemplate
                    PipeKeyTemplate.objects.update_or_create(
                        pipe=pipe,
                        defaults={"keys": self.extract_keys(basic_data)},
                    )

                    # On update: also update marked_as_favorite if present
                    if is_update and "marked_as_favorite" in request.data:
                        pipe.marked_as_favorite = request.data.get("marked_as_favorite")
                        pipe.save()

                message = (
                    "Pipe updated successfully"
                    if is_update
                    else "Pipe created successfully"
                )
                return self.success_response(message)

        except Exception as e:
            action = "update" if is_update else "creation"
            return self.error_response(f"Pipe {action} failed: {str(e)}")

    def post(self, request, *args, **kwargs):
        return self.create_or_update_pipe(request)

    def get(self, request, pk=None):
        user_discount = (
            UserDiscount.objects.filter(user_id=request.user.id).values().first()
        )
        if user_discount:
            discount_list = user_discount.get("discount_data", [])
            self.discount_data = {
                int(item["id"]): item for item in discount_list if "id" in item
            }
        else:
            self.discount_data = {}

        base_url = request.build_absolute_uri("/").rstrip("/")

        # If pk is provided, return a specific pipe
        if pk:
            try:
                pipe = (
                    Pipe.objects.filter(pk=pk, product__isnull=False)
                    .select_related("product", "parent")
                    .first()
                )
                serializer = PipeSerializer(pipe)
                result_data = serializer.data
                processed_data = self.update_image_urls_recursively(
                    base_url, result_data
                )
                product = pipe.product
                parent = product.parent if product else None
                grandparent = parent.parent if parent else None

                names = [
                    grandparent.name if grandparent else None,
                    parent.name if parent else None,
                    product.name if product else None,
                ]

                processed_data["sub_category_full_name"] = "   ➤   ".join(
                    [n for n in names if n][-2:]
                )

                return self.success_response(
                    f"Product with ID {pk} fetched successfully", processed_data
                )
            except Pipe.DoesNotExist:
                return self.error_response(f"Product with ID {pk} not found")

        # If no pk, return the list of pipes
        queryset = Pipe.objects.filter(
            parent__isnull=True, product__isnull=True
        ).order_by("position")

        name_filter = request.query_params.get("name")
        if name_filter:
            queryset = queryset.filter(name__icontains=name_filter)

        serializer = RecursivePipeSerializer(queryset, many=True)
        result_data = serializer.data

        processed_data = self.update_image_urls_recursively(base_url, result_data)

        return self.success_response("Pipe list fetched successfully", processed_data)

    def delete(self, request, pk=None):
        try:
            # Retrieve the pipe
            pipe = Pipe.objects.get(id=pk)

            # Recursively delete all sub-categories
            self._recursive_delete(pipe)

            return self.success_response(
                f"Pipe {pk} and all its sub-categories deleted successfully"
            )

        except Pipe.DoesNotExist:
            return self.error_response(f"Pipe {pk} not found")

    def _recursive_delete(self, pipe):
        """
        Recursively delete a pipe and all its sub-categories,
        including the associated image file from the storage.
        """
        # First, delete all sub-categories
        for sub_category in pipe.sub_categories.all():
            self._recursive_delete(sub_category)

        # Delete the image file from the storage if it exists
        if pipe.image and pipe.image.name:
            if os.path.isfile(pipe.image.path):  # This ensures the file exists before deleting
                os.remove(pipe.image.path)

        # Then delete the pipe itself
        pipe.delete()

    def put(self, request, pk=None, *args, **kwargs):
        try:
            pipe = Pipe.objects.get(id=pk)
            return self.create_or_update_pipe(request, instance=pipe)
        except Pipe.DoesNotExist:
            return self.error_response(f"Pipe {pk} not found")


class GetPipeViewset(DefaultResponseMixin, generics.GenericAPIView):
    permission_classes = [CustomAPIPermissions]
    public_methods = ["GET", "POST", "PUT", "DELETE"]

    def get_related_pipes(self, start_id):
        visited = set()
        sub_categories_name_list = []
        product_list = []

        def recurse(current_id):
            if current_id in visited:
                return
            visited.add(current_id)
            try:
                pipe = Pipe.objects.get(id=current_id)
            except Pipe.DoesNotExist:
                return
            # Stop if this pipe has a product assigned
            if pipe.parent and not pipe.product:
                sub_categories_name_list.append(pipe.name)
            if pipe.product:
                product_list.append(pipe)
                return
            # Continue if no product
            children = Pipe.objects.filter(
                models.Q(parent=pipe) | models.Q(product=pipe)
            ).exclude(id=current_id)
            for child in children:
                recurse(child.id)

        recurse(start_id)
        return sub_categories_name_list, product_list

    def get(self, request, pk=None):
        related_product = []
        sub_categories_name_list, product_list = self.get_related_pipes(pk)
        base_url = request.build_absolute_uri("/").rstrip("/")
        for product in product_list:
            related_product.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "image": base_url + product.image.url,
                    "parent_id": product.parent_id,
                    "product_id": product.product_id,
                    "marked_as_favorite": product.marked_as_favorite,
                    "sub_categorie_name": product.product.name,
                    "sub_category_full_name": (
                        (
                            product.parent.name + "   ➤   "
                            if product.parent and product.parent.name
                            else ""
                        )
                        + (
                            product.product.name
                            if product.product and product.product.name
                            else ""
                        )
                    ),
                }
            )
        response_data = {
            "filtter_list": sub_categories_name_list,
            "related_product_list": related_product,
        }
        return self.success_response("Products List Fetch successfully", response_data)


class BestSellerViewset(DefaultResponseMixin, generics.GenericAPIView):
    permission_classes = [CustomAPIPermissions]
    public_methods = ["GET"]
    admin_only_methods = ["POST", "PUT", "DELETE"]

    def post(self, request):
        serializer = BestSellerSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("BestSeller Placed successfully")
        return self.error_response("BestSeller Placed Faild")

    def put(self, request, pk):
        queryset = BestSeller.objects.filter(id=pk).first()
        if not queryset:
            return self.error_response("BestSeller Not Found")
        serializer = BestSellerSerializer(queryset, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return self.success_response("BestSeller Update successfully")
        return self.error_response("BestSeller Update Faild")

    def get(self, request):
        # Step 1: Aggregate quantities from order_items
        best_seller = BestSeller.objects.all().first()
        if not best_seller:
            return self.error_response("BestSeller Data Not Found")
        if best_seller.toggel:
            product_quantities = defaultdict(int)
            orders = Order.objects.exclude(status="CANCEL")
            for order in orders:
                items = order.order_items or []
                for item in items:
                    product_id = item.get("item_id")
                    quantity = item.get("quantity", 0)
                    if product_id:
                        product_quantities[product_id] += int(quantity)

            # Step 2: Match with BestSeller and prepare response

            best_sellers_product = Pipe.objects.filter(
                id__in=product_quantities.keys()
            ).select_related("product", "parent")
            for bs in best_sellers_product:
                bs.total_order_quantity = product_quantities.get(bs.id, 0)

            # Step 3: Sort by total quantity
            sort_best_sellers = sorted(
                best_sellers_product, key=lambda x: x.total_order_quantity, reverse=True
            )

            # Step 4: Limit to BestSeller.quantity
            top_n = best_seller.quantity  # default to 5 if not set
            sorted_best_sellers = sort_best_sellers[:top_n]

            base_url = request.build_absolute_uri("/").rstrip("/")

            # Step 5: Serialize and return
            serializer = PipeSerializer(sorted_best_sellers, many=True)
            serialized_data = serializer.data
            for i, bs in enumerate(sorted_best_sellers):
                serialized_data[i]["sub_category_full_name"] = (
                    f"{bs.product.parent.parent.name}   ➤   {bs.product.parent.name}   ➤   {bs.product.name}"
                    if bs.product.parent and bs.product.parent.parent
                    else (
                        f"{bs.product.parent.name}   ➤   {bs.product.name}"
                        if bs.product.parent
                        else bs.product.name
                    )
                )

                image_url = getattr(bs.image, "url", "") if bs.id else ""

                serialized_data[i]["image"] = base_url + image_url
            return self.success_response(
                "BestSeller Fetched Successfully", serializer.data
            )
        return self.success_response("BestSeller Fetched Successfully")

    def delete(self, request, pk):
        best_seller = BestSeller.objects.filter(id=pk).filter()
        if not best_seller:
            return self.error_response("BestSeller Not Found")

        best_seller.delete()
        return self.success_response("BestSeller Delete Successfully")


class GetBestSellerViewset(DefaultResponseMixin, generics.GenericAPIView):
    permission_classes = [CustomAPIPermissions]
    admin_only_methods = ["GET"]

    def get(self, request):
        best_seller = BestSeller.objects.all()
        serializer = BestSellerSerializer(best_seller, many=True)
        return self.success_response("BestSeller Fetched Successfully", serializer.data)


class GetMainCategoryViewset(DefaultResponseMixin, generics.GenericAPIView):
    permission_classes = [CustomAPIPermissions]
    public_methods = ["GET", "POST", "PUT", "DELETE"]

    def get(self, request):
        try:
            main_category = Pipe.objects.filter(
                parent__isnull=True, product__isnull=True
            ).values("id", "name", "image")
            base_url = request.build_absolute_uri("/").rstrip("/") + "/media/"
            for category in main_category:
                if category.get("image"):
                    category["image"] = base_url + category.get("image")
                else:
                    category["image"] = None
            return self.success_response(
                "Main Category Fetched Successfully", main_category
            )
        except:
            return self.error_response("Main Category Not Fetched")


class MarkedAsfavoriteViewset(DefaultResponseMixin, generics.GenericAPIView):
    permission_classes = [CustomAPIPermissions]
    public_methods = ["GET", "POST", "PUT", "DELETE"]

    def get(self, request):
        queryset = Pipe.objects.filter(marked_as_favorite=True).values(
            "id", "name", "image", "marked_as_favorite"
        )
        if not queryset:
            return self.error_response("Data Not found")
        for makasfavoritedata in queryset:
            base_url = request.build_absolute_uri("/").rstrip("/") + "/media/"
            makasfavoritedata["image"] = base_url + makasfavoritedata.get("image")
            pipe_detail = PipeDetail.objects.filter(
                pipe=makasfavoritedata.get("id")
            ).first()
            if pipe_detail:
                makasfavoritedata["basic_data"] = pipe_detail.basic_data
        return self.success_response(
            "MarkedAsfavorite Featched Succsessfully", queryset
        )


class PipeDetailViewset(DefaultResponseMixin, generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        # Use create update serializer for handling nested creation
        serializer = PipeDetailSerializer(data=request.data)

        try:
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                # Use recursive serializer to return full nested structure
                return self.success_response(
                    "Pipe Detail successfully",
                )
        except Exception as e:
            return self.error_response(f"Pipe creation failed: {str(e)}")

    def put(self, request, pk):

        querytset = PipeDetail.objects.get(pipe__id=pk)
        if not querytset:
            return self.error_response("Pipe Details Not Found")

        serializer = PipeDetailSerializer(querytset, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return self.success_response("Pipe Detail Update successfully")
        return self.error_response("PipeDetail Update Faild")


class PipeKeyTemplateViewset(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = PipeKeyTemplateSerializer
    queryset = PipeKeyTemplate.objects.all()

    def get(self, request, *args, **kwargs):
        pipe_id = request.query_params.get("pipe_id")

        if pipe_id:
            queryset = PipeKeyTemplate.objects.filter(pipe__id=pipe_id)
            if not queryset.exists():
                return self.error_response(
                    "No Pipe Key Template found for given pipe_id"
                )
            serializer = self.get_serializer(queryset, many=True)
            return self.success_response(
                "Pipe Key Templates for given pipe_id retrieved", serializer.data
            )
        else:
            queryset = PipeKeyTemplate.objects.all()
            serializer = self.get_serializer(queryset, many=True)
            return self.success_response(
                "All Pipe Key Templates retrieved successfully", serializer.data
            )

    def post(self, request, *args, **kwargs):
        pipe_id = request.data.get("pipe")

        if not pipe_id:
            return self.error_response("pipe ID is required")

        # Check if pipe exists and is not a product
        try:
            pipe_instance = Pipe.objects.get(id=pipe_id)
            if pipe_instance.product:
                return self.error_response("Cannot create template for a product pipe")
        except Pipe.DoesNotExist:
            return self.error_response("Pipe not found")

        # Proceed with creation if valid
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return self.success_response("Pipe Key Template created successfully")
        except Exception as e:
            return self.error_response(f"Pipe Key Template creation failed: {str(e)}")

    def put(self, request, pk):
        try:
            instance = PipeKeyTemplate.objects.get(pk=pk)
        except PipeKeyTemplate.DoesNotExist:
            return self.error_response("Pipe Key Template not found")

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return self.success_response("Pipe Key Template updated successfully")
        return self.error_response("Pipe Key Template update failed")

    def delete(self, request, pk):
        try:
            instance = PipeKeyTemplate.objects.get(pk=pk)
            instance.delete()
            return self.success_response("Pipe Key Template deleted successfully")
        except PipeKeyTemplate.DoesNotExist:
            return self.error_response("Pipe Key Template not found")


# Update positions of multiple items
class PositionUpdateView(DefaultResponseMixin, generics.GenericAPIView):
    def post(self, request):
        serializer = PositionUpdateSerializer(data=request.data)
        if serializer.is_valid():
            items_data = serializer.validated_data["product"]

            with transaction.atomic():
                for item_data in items_data:
                    try:
                        pipe = Pipe.objects.get(id=item_data["id"])
                        pipe.position = item_data["position"]
                        pipe.save(update_fields=["position"])
                    except Pipe.DoesNotExist:
                        return self.error_response(
                            f"Pipe with ID {item_data['id']} not found"
                        )

            return self.success_response("Positions updated successfully")

        return self.error_response(serializer.errors)


# Bulk reorder items (like the management command)
class BulkReorderView(DefaultResponseMixin, generics.GenericAPIView):
    def post(self, request):
        serializer = BulkPositionUpdateSerializer(data=request.data)
        if serializer.is_valid():
            items_data = serializer.validated_data["categories"]

            with transaction.atomic():
                for item_data in items_data:
                    try:
                        pipe = Pipe.objects.get(id=item_data["id"])
                        pipe.position = item_data["position"]
                        pipe.save(update_fields=["position"])
                    except Pipe.DoesNotExist:
                        return self.error_response(
                            f"Pipe with ID {item_data['id']} not found"
                        )

            return self.success_response("Positions updated successfully")

        return self.error_response(serializer.errors)
