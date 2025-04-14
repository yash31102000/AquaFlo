from rest_framework import serializers
from stocks.models import StockTransaction


class StockTransactionSerializer(serializers.ModelSerializer):
    pipe_name = serializers.CharField(source="pipe.name", read_only=True)
    pipe_image = serializers.CharField(source="pipe.image", read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            "id",
            "pipe",
            "pipe_name",
            "pipe_image",
            "transaction_type",
            "quantity",
            "timestamp",
            "note",
            "alert",
        ]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Rename 'transaction_type' to 'last_transaction_type' in the output
        rep["last_transaction_type"] = rep.pop("transaction_type")
        return rep
