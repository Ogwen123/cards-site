//import React from "react"

import { ChevronDoubleUpIcon, LightBulbIcon, ShareIcon } from "@heroicons/react/20/solid"

const Home = () => {

    return (
        <div className="fc">
            <div className="flex items-center mh-body max-w-[50vw] flex-col pt-[30vh]">
                <div className="text-5xl font-bold flex flex-row h-[60px]"><span className="color-white whitespace-pre">Cards: </span><span className="bg-gradient-to-r from-main to-[#f57c00] inline-block text-transparent bg-clip-text">Boost Your Knowledge</span></div>
                <div className='my-[5px] bg-hr rounded-lg h-[1px] w-4/5'></div>
                <div className="flex flex-col lg:flex-row mt-[10px] w-[1020px] justify-between">
                    <div className="max-w-sm p-6 border rounded-lg shadow-sm bg-bgdark border-gray-700 w-[320px]">
                        <div className="text-xl mb-[10px] flex flex-row">Boost Knowledge<LightBulbIcon className="text-yellow-400 size-8" /></div>
                        <div className="text-textlight">Easily create revision materials to boost knowledge.</div>
                    </div>
                    <div className="max-w-sm p-6 border rounded-lg shadow-sm bg-bgdark border-gray-700 w-[320px]">
                        <div className="text-xl mb-[10px] flex flex-row">Incentivise Learning <ChevronDoubleUpIcon className="text-green-500 size-8" /></div>
                        <div className="text-textlight">Gain XP by completing daily tests to incentive learning. WIP</div>
                    </div>
                    <div className="max-w-sm p-6 border rounded-lg shadow-sm bg-bgdark border-gray-700 w-[320px]">
                        <div className="text-xl mb-[10px] flex flex-row">Share Decks <ShareIcon className="text-blue-500 size-8 ml-[4px]" /></div>
                        <div className="text-textlight">Easily share decks using a link.</div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Home