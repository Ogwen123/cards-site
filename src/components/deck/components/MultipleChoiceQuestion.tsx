import React from 'react'
import { MultipleChoiceQuestionT } from '../../../global/types'

interface MultipleChoiceQuestionProps {
    question: MultipleChoiceQuestionT,
    updateMutlipleChoiceAnswers: (questionIndex: number, correctOption: boolean, optionString: string) => void
}

const MultipleChoiceQuestion = ({ question, updateMutlipleChoiceAnswers }: MultipleChoiceQuestionProps) => {
    const [selected, setSelected] = React.useState<number>()

    return (
        <div className='w-full h-[300px] rounded-lg bg-bgdark p-[10px] mt-[10px]'>
            <div className='w-full h-1/3 flex flex-col p-[10px]'>
                <div className='text-sm text-textlight'>
                    Your term is
                </div>
                <div className='text-lg'>
                    {question.question}
                </div>
            </div>
            <div className='w-full h-2/3 '>
                <div className='text-sm text-textlight h-1/5 flex items-center p-[10px]'>
                    Your options are
                </div>
                <div className='grid grid-cols-2 h-4/5'>
                    {
                        question.options.map((val, index) => {
                            return (
                                <div
                                    key={index}
                                    className={
                                        selected === index ?
                                            'rounded-lg bg-main fc m-[10px] border-solid border-[1px] border-bgdark'
                                            :
                                            'rounded-lg bg-bg fc m-[10px] border-solid border-[1px] border-bgdark hover:border-main'
                                    }
                                    onClick={() => {
                                        setSelected(index)
                                        updateMutlipleChoiceAnswers(question.id, val.correct, val.val)
                                    }}
                                >
                                    {val.val}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div >
    )
}

export default MultipleChoiceQuestion