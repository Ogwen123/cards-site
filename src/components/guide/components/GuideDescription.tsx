//import React from 'react'

interface GuideDescriptionProps {
    description: string
}

const GuideDescription = ({ description }: GuideDescriptionProps) => {
    return (
        <div className='text-textlight'>{description}</div>
    )
}

export default GuideDescription