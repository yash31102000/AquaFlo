from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from .models import StockTransaction
from .serializers import StockTransactionSerializer
from django.db.models import F, ExpressionWrapper, IntegerField, Case, When
from category.models import Pipe

# Create your views here.


class StockTransactionView(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = StockTransactionSerializer

    def post(self, request):
        print(request.data,"?"*10)
        pipe_id = StockTransaction.objects.filter(pipe=request.data.get("pipe")).first()
        if pipe_id:
            return self.error_response("Stock already exit")
        serializer = self.get_serializer(data=request.data)

        try:
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return self.success_response(
                    "Stock recorded successfully",
                )

        except ValueError as e:
            return self.error_response(str(e))  # for stock errors
        except Exception as e:
            return self.error_response(f"Stock add failed: {str(e)}")

    def get(self, request):
        # queryset = StockTransaction.objects.all()
        queryset = StockTransaction.objects.annotate(
            diff=ExpressionWrapper(
                F("quantity") - F("alert"), output_field=IntegerField()
            ),
            priority=Case(
                When(diff__lte=10, then=0),  # High priority (near alert)
                default=1,  # Low priority (not near)
                output_field=IntegerField(),
            ),
        ).order_by(
            "priority", "diff"
        )  # Show near alert items first

        serializer = StockTransactionSerializer(queryset, many=True)
        base_url = request.build_absolute_uri("/").rstrip("/")
        for data in serializer.data:
            product_image = Pipe.objects.filter(id=data.get("pipe")).first()
            image = str(product_image.image) if product_image.id else None
            data["pipe_image"] = base_url + "/media/" + image
        return self.success_response(
            "Stock detalis feached succesfully", serializer.data
        )

    def put(self, request, pk=None):

        transaction_type = request.data.get("transaction_type")
        stock_id = StockTransaction.objects.filter(id=pk).first()
        if not stock_id:
            return self.error_response("Stock Not Found")
        if transaction_type == "IN":
            stock_id.transaction_type = transaction_type
            stock_id.quantity += request.data.get("quantity")

        if transaction_type == "OUT":
            stock_id.transaction_type = transaction_type
            stock_id.quantity -= request.data.get("quantity")

        stock_id.save()

        return self.success_response("Stock Update Successfully")

class StockProductlistView(DefaultResponseMixin, generics.GenericAPIView):
    def get(self, request):
        try:
            base_url = request.build_absolute_uri("/").rstrip("/")

            # Get full model instances with product data
            pipes = Pipe.objects.exclude(
                id__in=StockTransaction.objects.values_list('pipe_id', flat=True)
            ).filter(product__isnull=False).select_related('product')

            stock_product = []
            for pipe in pipes:
                
                image = str(pipe.product.image) if pipe.product else (str(pipe.image) if pipe.id else "")

                stock_product.append({
                    "id": pipe.id,
                    "name": pipe.name,
                    "image": base_url + '/media/' + image if image else None,
                    "parent_id": pipe.parent_id,
                    "product_id": pipe.product_id,
                    "Size": pipe.Size,
                    "MM": pipe.MM,
                    "Packing": pipe.Packing,
                    "large_bag": pipe.large_bag,
                    "marked_as_favorite": pipe.marked_as_favorite,
                })

            return self.success_response("Stock Product List Featched.", stock_product)
        except Exception as e:
            return self.error_response(f"Stock Product List Not Featched: {str(e)}")
