from django.utils import timezone
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import IsAdminOrReadOnly
from .models import *
from .serializers import *
from category.models import SubItem
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class OrderViewSet(DefaultResponseMixin, generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer  # Use OrderSerializer to handle order creation

    def post(self, request):
        # Create the Order with valid order_items (IDs of SubItems)
        request.data["user"] = request.user.id
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Order placed successfully")
        return self.error_response("Order Placed Faild")
    
    def get(self, request):
        queryset = Order.objects.all().order_by("created_at")
        serializer = OrderSerializer(queryset ,many=True)
        response_data = serializer.data.copy()
        for data in response_data:
            for order_items in  data.get("order_items"):
                sub_item = SubItem.objects.filter(pk=order_items.get("item_id")).values().first()
                order_items.pop("item_id")
                order_items["item"] = sub_item
        return self.success_response("Order list fetched successfully", serializer.data)
    

    def put(self,request,pk):
        
        order = Order.objects.filter(id=pk).first()

        if not order:
            return self.error_response("Order not found")
        
        status = request.data.get('status')
        if status == 'CANCEL':
            cancellation_reason = request.data.get('cancellation_reason')
            if not cancellation_reason:
                return self.error_response('Cancellation reason is required when order status is CANCEL.')
            
        serializer = OrderSerializer(order,data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Order Update successfully")
        return self.error_response("Order Update Faild")