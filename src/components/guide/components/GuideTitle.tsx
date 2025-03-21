//import React from 'react'

interface GuideTitleProps {
    title: string
}

const GuideTitle = ({ title }: GuideTitleProps) => {
    return (
        <div className='w-full my-[10px] p-[5px] text-2xl fc'>{title}</div>
    )
}

export default GuideTitle