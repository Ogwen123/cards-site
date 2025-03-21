import {
    ExclamationCircleIcon,
    CheckCircleIcon
} from "@heroicons/react/20/solid"

interface AlertProps {
    message: string,
    show: boolean,
    severity: "SUCCESS" | "ERROR" | "NONE"
}

const Alert = ({ message, show, severity }: AlertProps) => {

    let colour = severity === "ERROR" ? "bg-error" : "bg-success"


    if (show) {
        return (
            <div className={`flex items-center bg-bgdark rounded-lg w-2/5 overflow-hidden`}>
                <div className={colour + " self-start fc h-[50px] w-[50px] p-[5px]"}>
                    {
                        severity === "ERROR" ?
                            <ExclamationCircleIcon className="h-7 w-7 m-[5px]" />
                            :
                            <CheckCircleIcon className="h-7 w-7 m-[5px]" />
                    }
                </div>
                <div className={colour + " bg-opacity-60 self-center text-center w-full h-[50px] leading-[50px]"}>{message}</div>
            </div>
        )
    } else {
        return (<div className="hidden"></div>)
    }
}

export default Alert