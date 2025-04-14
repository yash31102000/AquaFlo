from requests import Response
from category.models import Pipe
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from stocks.models import StockTransaction
from stocks.serializers import StockTransactionSerializer


# Create your views here.
# views.py


class StockTransactionView(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = StockTransactionSerializer

    def post(self, request):
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

        queryset = StockTransaction.objects.all()
        serializer = StockTransactionSerializer(queryset, many=True)
        base_url = request.build_absolute_uri("/").rstrip("/")
        for data in serializer.data:
            data["pipe_image"] = base_url+'/media/'+data.get("pipe_image")
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
