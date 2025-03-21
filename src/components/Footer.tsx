//import React from 'react'

const Footer = () => {
    return (
        <div className='flex flex-row justify-center mt-[20px]'>
            <a
                href="https://github.com/ogwen123"
                target="_blank"
            >
                <img
                    src="https://i.ibb.co/6b7zkrb/github.png"
                    alt="frontend dev"
                    title="Frontend Dev"
                    className='h-7 w-7'
                />
            </a>

            <div className='bg-hr w-[1px] h-7 mx-2'></div>

            <a
                href="https://github.com/Ben754444"
                target="_blank"
            >
                <img
                    src="https://i.ibb.co/6b7zkrb/github.png"
                    alt="backend dev"
                    title="Backend Dev"
                    className='h-7 w-7'
                />
            </a>
        </div>
    )
}

export default Footer