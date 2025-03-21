interface ErrorProps {
    message: string[]
}

const Error = ({ message }: ErrorProps) => {
    return (
        <div className="fc w-full flex-col mh-body">
            <div className="text-6xl text-main fc">Error</div>
            <div className="text-4xl fc w-[50vw] text-center flex-col">
                {message.map((message, index) => {
                    let size = ""
                    if (index === 0) {
                        size = "text-4xl"
                    } else {
                        size = "text-2xl"
                    }
                    return (
                        <div key={index} className={size}>{message}</div>
                    )
                })}
            </div>
        </div>
    )
}

export default Error