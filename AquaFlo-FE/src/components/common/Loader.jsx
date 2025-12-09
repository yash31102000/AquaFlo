const Loader = ({ message }) => {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-whit">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#13609b] border-t-transparent"></div>
            {message && (
                <p className="mt-4 text-lg font-medium text-[#13609b]">
                    {message}
                </p>
            )}
        </div>
    );
};
export default Loader;      