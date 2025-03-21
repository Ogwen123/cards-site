//import React from 'react'

interface GuideExtraInfoProps {
    type: "BAD" | "WARNING" | "GOOD",
    title: string,
    description: string

}

const GuideExtraInfo = ({ type, title, description }: GuideExtraInfoProps) => {

    const colours = {
        "BAD": "error",
        "WARNING": "warning",
        "GOOD": "success"
    }

    const containerClassname = `bg-${colours[type]}`
    return (
        <div className={'w-full rounded-lg p-[10px] my-[10px] bg-opacity-50 ' + containerClassname}>
            <div className='text-lg'>{title}</div>
            <div className='text-sm'>{description}</div>
        </div>
    )
}

export default GuideExtraInfo