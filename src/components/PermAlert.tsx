import {
    ExclamationCircleIcon,
    XMarkIcon
} from '@heroicons/react/20/solid'
import React from 'react'

interface PermAlertProps {
    message: string,
    margin: boolean
}

const PermAlert = ({ message, margin }: PermAlertProps) => {

    const [show, setShow] = React.useState<boolean>(true)

    if (show) {
        return (
            <div className={`flex items-center bg-bgdark rounded-lg w-2/5 overflow-hidden ${margin ? "mb-[10px]" : ""}`}>
                <div className={"bg-warning self-start fc h-[50px] w-[50px] p-[5px]"}>
                    <ExclamationCircleIcon className="h-7 w-7 m-[5px]" />
                </div>
                <div className={"bg-warning bg-opacity-60 self-center text-center w-full h-[50px] leading-[50px]"}>{message}</div>
                <div
                    className='w-10 bg-warning bg-opacity-60 h-[50px] fc'
                    onClick={() => { setShow(false) }}
                >
                    <XMarkIcon className='w-7 h-7 hover:text-error' />
                </div>
            </div>
        )
    } else {
        return (<div className="hidden"></div>)
    }
}

export default PermAlert