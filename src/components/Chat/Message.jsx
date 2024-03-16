export const Message = ({ message }) => {
    return (
        <div className="flex w-full justify-center">
            <div className="relative flex w-[300px] flex-col py-6 sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px]">
                <div className="space-y-3">
                    {message.content}
                </div>
            </div>
        </div>
    )
}