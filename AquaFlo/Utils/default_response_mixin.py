from rest_framework import status, response


class DefaultResponseMixin:
    def success_response(self, message, data=None):
        """
        Create a standardized success response with 200 OK status

        :param message: Success message to be returned
        :param data: Optional data to be included in the response
        :return: Response object with 200 OK status
        """
        response_data = {"status": True, "message": message, "data": data or {}}

        return response.Response(response_data, status=status.HTTP_200_OK)

    def error_response(self, message, data=None):
        """
        Create a standardized error response with 200 OK status

        :param message: Error message to be returned
        :param data: Optional error data to be included in the response
        :return: Response object with 200 OK status
        """
        response_data = {"status": False, "message": message, "data": data or {}}
        return response.Response(response_data, status=status.HTTP_200_OK)
