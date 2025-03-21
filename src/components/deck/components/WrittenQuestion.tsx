//import React from 'react'
import { WrittenQuestionT } from "../../../global/types"

interface WrittenQuestionProps {
    question: WrittenQuestionT
}

const WrittenQuestion = ({ question }: WrittenQuestionProps) => {
    return (
        <div className='w-full h-[200px] rounded-lg bg-bgdark p-[10px] mt-[10px]'>
            <div className='w-full h-1/2 flex flex-col p-[10px]'>
                <div className='text-sm text-textlight'>
                    Your term is
                </div>
                <div className='text-lg'>
                    {question.question}
                </div>
            </div>
            <div className='w-full h-1/2 '>
                <div className='text-sm text-textlight h-1/5 flex items-center p-[10px]'>
                    Your answer
                </div>
                <div className="p-[10px]">
                    <input
                        type="text"
                        placeholder="Answer"
                        className="rounded-lg px-[5px] py-[2px] w-full my-[5px] bg-bgdark border-solid border-b-[1px] border-main outline-none"
                        id={"written-answer-" + question.id}
                    />
                </div>
            </div>
        </div >
    )
}

export default WrittenQuestion