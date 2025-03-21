//import React from 'react'

import config from "../../config.json"

const Index = () => {
    return (
        <div className='w-full fc'>
            <div className='w-3/5'>
                <div className='text-2xl text-center my-[10px]'>Guides</div>
                {
                    config.guides.guides.map((val, index) => {
                        return (
                            <div className='w-full rounded-lg bg-bgdark p-[10px]' key={index}>
                                <div className='text-xl'>
                                    {val.name}
                                </div>
                                <div className='text-textlight my-[10px]'>
                                    {val.description}
                                </div>
                                <a href={"/guide/" + val.link}>
                                    <button className='button'>
                                        view
                                    </button>
                                </a>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Index