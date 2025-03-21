//import React from 'react'

import GuideDescription from "./components/GuideDescription"
import GuideExtraInfo from "./components/GuideExtraInfo"
import GuideTitle from "./components/GuideTitle"

const QuizletExport = () => {
    return (
        <div className="fc">
            <div className="w-3/5">
                <GuideTitle title="Import from Quizlet" />
                <GuideDescription description="This guide will show you how to import the cards from a quizlet set." />
                <GuideExtraInfo type="WARNING" title="Ownership" description="To export data from a quizlet set you have to be the owner of the set (for some stupid and unfathomable reason), however quizlet provides an easy way for you to save a deck as your own." />
                <div className="text-xl">Steps</div>
                <div className="text-textlight">
                    If you already own the list you want to import then start reading at step 3.
                </div>
                <ol className="list-decimal ml-[15px]">
                    <li>On the set you want to import click the overlapping paper icon below the card carousel.</li>
                    <img src="https://i.ibb.co/LN1b2ZX/firefox-2-HIRfo1-Orw.png" className="h-[285px] w-[635px]"></img>
                    <li>Then click create on the "Create a new study set" page.</li>
                    <li>Once on the set that you want to export, and are the owner of, click the three dots then the export button.</li>
                    <img src="https://i.ibb.co/4FV91Ck/firefox-MHc-Pjv4k7-C.png" className="h-[285px] w-[635px]"></img>
                    <li>Once on the export dialog select the correct export format, comma between term and definition and semi colon between rows, and click the copy text button.</li>
                    <img src="https://i.ibb.co/KL9vn0F/firefox-fb-KOJc5-Rw1.png" className="h-[400px] w-[400px]"></img>
                    <li>Then paste the text you copied into the input on the cards Create Deck page.</li>
                    <GuideExtraInfo type="WARNING" title="Formatting" description="Make sure you keep the format exactly the same as the copied text or it will be rejected by the website." />
                </ol>
            </div>
        </div>
    )
}

export default QuizletExport