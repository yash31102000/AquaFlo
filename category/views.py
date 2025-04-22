from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .serializers import *
from order.models import Order
from collections import defaultdict
from django.db.models import Q

class PipeViewSet(DefaultResponseMixin, generics.GenericAPIView):
    def update_image_urls(self, base_url, data):
        if isinstance(data, list):
            for item in data:
                self.update_image_urls(base_url, item)
        elif isinstance(data, dict):
            for key, value in data.items():
                if key == "image" and value:
                    data[key] = f"{base_url}{value}"
                elif isinstance(value, (dict, list)):
                    self.update_image_urls(base_url, value)

    serializer_class = PipeCreateUpdateSerializer

    def post(self, request, *args, **kwargs):
        # Check if the pipe with the same name already exists at the same level
        parent_id = request.data.get("parent")
        name = request.data.get("name")

        # Check for existing pipe with the same name under the same parent
        existing_pipe_query = Pipe.objects.filter(name=name)
        if parent_id:
            existing_pipe_query = existing_pipe_query.filter(parent_id=parent_id)

        if existing_pipe_query.exists():
            return self.error_response(
                "Pipe with this name already exists at this level"
            )

        # Use create update serializer for handling nested creation
        serializer = PipeCreateUpdateSerializer(data=request.data)

        try:
            if serializer.is_valid(raise_exception=True):
                pipe = serializer.save()
                # Use recursive serializer to return full nested structure
                response_serializer = RecursivePipeSerializer(pipe)
                return self.success_response(
                    "Pipe created successfully",
                    response_serializer.data,
                )
        except Exception as e:
            return self.error_response(f"Pipe creation failed: {str(e)}")

    def get(self, request):
        # Fetch only top-level pipes (no parent)
        queryset = Pipe.objects.filter(parent__isnull=True, product__isnull=True)
        # Optional: Add support for filtering
        name_filter = request.query_params.get("name")
        if name_filter:
            queryset = queryset.filter(name__icontains=name_filter)

        # Use recursive serializer to get full nested structure
        serializer = RecursivePipeSerializer(queryset, many=True)
        base_url = request.build_absolute_uri("/").rstrip("/")
        updated_data = serializer.data
        self.update_image_urls(base_url, updated_data)
        return self.success_response("Pipe list fetched successfully", serializer.data)

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
        Recursively delete a pipe and all its sub-categories
        """
        # First, delete all sub-categories
        for sub_category in pipe.sub_categories.all():
            self._recursive_delete(sub_category)

        # Then delete the pipe itself
        pipe.delete()

    def put(self, request, pk=None):
        try:
            # Retrieve the existing pipe
            pipe = Pipe.objects.get(id=pk)
            
            if pipe.product is not None and "marked_as_favorite" in request.data:
                pipe.marked_as_favorite = request.data.get("marked_as_favorite")
                pipe.save()
            # Use create update serializer for handling update
            serializer = PipeCreateUpdateSerializer(
                pipe, data=request.data, partial=True
            )

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return self.success_response(
                    "Pipe updated successfully"
                )

        except Pipe.DoesNotExist:
            return self.error_response(f"Pipe {pk} not found")
        except Exception as e:
            return self.error_response(f"Pipe update failed: {str(e)}")


class GetPipeViewset(DefaultResponseMixin, generics.GenericAPIView):
    def update_image_urls(self, base_url, data):
        if isinstance(data, list):
            for item in data:
                self.update_image_urls(base_url, item)
        elif isinstance(data, dict):
            for key, value in data.items():
                if key == "image" and value:
                    data[key] = f"{base_url}{value}"
                elif isinstance(value, (dict, list)):
                    self.update_image_urls(base_url, value)

    def get(self, request, pk=None):
        try:
            main_pip = Pipe.objects.filter(pk=pk).values().first()
            sub_categories = Pipe.objects.filter(parent=main_pip.get("id")).values()
            related_product = []
            sub_categories_name_list = []
            if sub_categories.exists():
                for sub_categorie in sub_categories:
                    sub_categories_name_list.append(sub_categorie.get("name"))
                    products = Pipe.objects.filter(
                        product=sub_categorie.get("id")
                    ).values()
                    for product in products:
                        base_url = (
                            request.build_absolute_uri("/").rstrip("/") + "/media/"
                        )
                        self.update_image_urls(base_url, product)
                        product["sub_categorie_name"] = sub_categorie.get("name")
                        related_product.append(product)
            products = Pipe.objects.filter(product=main_pip.get("id")).values()
            for product in products:
                base_url = request.build_absolute_uri("/").rstrip("/") + "/media/"
                self.update_image_urls(base_url, product)
                product["sub_categorie_name"] = ""
                related_product.append(product)
            response_data = {
                "filtter_list": sub_categories_name_list,
                "related_product_list": related_product,
            }
            return self.success_response(
                "Products List Fatch successfully", response_data
            )
        except Exception as e:
            return self.error_response("Product List Not Fatch")


class BestSellerViewset(DefaultResponseMixin, generics.GenericAPIView):

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

            best_sellers_product = Pipe.objects.filter(id__in=product_quantities.keys())
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
            for serializer_data in serializer.data:
                serializer_data["image"] = base_url + serializer_data.get("image")
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


class GetMainCategoryViewset(DefaultResponseMixin, generics.GenericAPIView):

    def get(self, request):
        try:
            main_category = Pipe.objects.filter(
                parent__isnull=True, product__isnull=True
            ).values("id", "name", "image")
            base_url = request.build_absolute_uri("/").rstrip("/") + "/media/"
            for category in main_category:
                category["image"] = base_url + category.get("image")
            return self.success_response(
                "Main Category Fetched Successfully", main_category
            )
        except:
            return self.error_response("Main Category Not Fetched")
    
class MarkedAsfavoriteViewset(DefaultResponseMixin, generics.GenericAPIView):

    def get(self,request):
        queryset = Pipe.objects.filter(marked_as_favorite=True).values("id","name","image","marked_as_favorite")
        if not queryset:
            return self.error_response("Data Not found")
        for makasfavoritedata in queryset:
            base_url = request.build_absolute_uri("/").rstrip("/") + "/media/"
            makasfavoritedata["image"] = base_url + makasfavoritedata.get("image")
        return self.success_response("MarkedAsfavorite Featched Succsessfully",queryset)
