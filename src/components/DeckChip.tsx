//import React from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import { DeckMeta } from '../global/types'
import { deconstruct } from '../utils/snowflake'

interface DeckChipProps {
    deck: DeckMeta,
    score?: number,
    width?: number
}

const DeckChip = ({ deck, score, width = 320 }: DeckChipProps) => {
    return (
        <div className={'bg-bgdark rounded-lg p-[20px] h-[300px] w-[' + width + 'px] flex flex-col justify-between'}>
            <p className='text-xl h-[33px] truncate'>{deck.name}</p>
            <div className='text-sm text-textlight'>{deck.topic}</div>
            <div className='text-xs text-textlight'>{score && `Score: ${score} | `}ID: {deck.id} | {new Date(Number(deconstruct(deck.id).timestamp)).toLocaleString().split(", ")[0].replaceAll("/", "-")}</div>{/* this score is the score assigned by the search */}
            <div className='my-[5px] bg-hr rounded-lg h-[2px]'></div>
            <div className='text-ellipsis text-sm h-[115px]'>{deck.description}</div>
            <div>
                <div className='my-[5px] bg-hr rounded-lg h-[2px]'></div>

                <div className='flex flex-row items-center mb-[5px]'>{/* this score is the score from people upvoting and downvoting */}
                    <StarIcon className='text-yellow-600 h-5 w-5 mr-[5px]' />
                    {deck.score}
                </div>
            </div>
            <a href={`/deck/${deck.id}/view`}><button className='button m-0'>View</button></a>
        </div>
    )
}

export default DeckChip