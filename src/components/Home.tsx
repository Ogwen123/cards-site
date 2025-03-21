//import React from "react"

const Home = () => {

    return (
        <div className="fc">
            <div className="flex items-center mh-body max-w-[40vw] flex-col pt-[30vh]">
                <div className="bg-gradient-to-r from-main to-[#f57c00] inline-block text-transparent bg-clip-text text-8xl font-bold">Cards</div>
                <div className="text-xl text-center">Create revision materials easily and efficently to boost your knowledge</div>
                <div className='my-[5px] bg-hr rounded-lg h-[1px] w-4/5'></div>
                <div>To start <a href="/account/register" className="no-underline hover:text-main">create an account</a> or <a href="/account/login" className="no-underline hover:text-main">log in</a></div>
            </div>
        </div>
    )
}

export default Home