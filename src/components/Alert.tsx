//import React from 'react'
import { AlertData } from '../global/types'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid'

interface AlertProps {
    content: string
    severity: "SUCCESS" | "ERROR"
    show: boolean,
    title?: string,
    width?: string
}

const Alert = ({ content, severity, show, title, width = "100%" }: AlertProps) => {
    let colour = severity === "ERROR" ? "bg-error" : "bg-success"

    return (
        show ?

            <div
                className="flex items-center bg-bgdark rounded-md h-[87px] mb-[5px]"
                style={{
                    width: width
                }}
            >
                <div className={colour + " fc h-full w-[50px] p-[5px] rounded-tl-md rounded-bl-md"}>
                    {
                        severity === "ERROR" ?
                            <ExclamationCircleIcon className="size-7 m-[5px]" />
                            :
                            <CheckCircleIcon className="size-7 m-[5px]" />
                    }
                </div>
                <div className={colour + ' bg-opacity-60 flex flex-col w-full items-center py-[5px] px-[10px] rounded-tr-md rounded-br-md'}>
                    <div className={"w-full h-[30px] text-xl"}>{title ? title : severity[0] + severity.slice(1).toLowerCase()}</div>
                    <div className={"w-full h-[47px] text-md overflow-hidden flex items-center"}>{content}</div>
                </div>
            </div>

            :
            <div className='hidden'></div>
    )
}

export default Alert

export const alertReset: AlertData = ["Alert", "ERROR", false]