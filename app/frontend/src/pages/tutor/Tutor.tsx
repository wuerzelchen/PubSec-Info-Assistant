// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, Card, Button } from 'react-bootstrap';
import { getHint, processAgentResponse, streamData } from '../../api';
import { useEffect, useState } from 'react';
import styles from './Tutor.module.css';
import ReactMarkdown from 'react-markdown';
import { MathFormatProfessionalFilled } from '@fluentui/react-icons';
import { Example, ExampleModel } from '../../components/Example';
import estyles from '../../components/Example/Example.module.css';
import CharacterStreamer from '../../components/CharacterStreamer/CharacterStreamer';
import '../../i18n';

const Tutor = () => {
    const { t, i18n } = useTranslation();
    const [streamKey, setStreamKey] = useState(0);
    const [renderAnswer, setRenderAnswer] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [mathProblem, setMathProblem] = useState('');
    const [output, setOutput] = useState('');
    const [selectedButton, setSelectedButton] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const ButtonValues = {
        Clues: t('buttonClues'),
        Solve: t('buttonSolve'),
        Answer: t('buttonAnswer')
    };

    const handleInput = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        userInput(mathProblem);
    };

    const userInput = (problem: string) => {
        console.log(problem);
    };

    function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function retryAsyncFn<T>(
        asyncFn: () => Promise<T>,
        retries: number = 3,
        delayMs: number = 1000
    ): Promise<T> {
        setError(false);
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await asyncFn();
            } catch (error) {
                setErrorMessage((error as Error).message);
                console.log(`Attempt ${attempt} failed. Retrying...`);
                console.log(`Error: ${(error as Error).message}`);
                if (attempt < retries) {
                    await delay(delayMs);
                }
            }
        }
        setError(true);
        throw new Error(`Max retries reached. Last error: ${errorMessage}`);
    }

    async function hinter(question: string) {
        setStreamKey(prevKey => prevKey + 1);
        setOutput('');
        setError(false);
        setRenderAnswer(true);
        await retryAsyncFn(() => getHint(question), 3, 1000).then(response => {
            setOutput(response.toString());
        });
    }

    async function getAnswer(question: string) {
        setStreamKey(prevKey => prevKey + 1);
        setError(false);
        setOutput('');
        setRenderAnswer(true);
        await retryAsyncFn(() => processAgentResponse(question), 3, 1000).then(response => {
            setOutput(response.toString());
        });
    }

    async function handleExampleClick(value: string) {
        setStreamKey(prevKey => prevKey + 1);
        setRenderAnswer(true);
        setMathProblem(value);
        getAnswer(value);
    }

    const EXAMPLES: ExampleModel[] = [
        { text: 'Determine the slope of the line passing through the points (2,5)(2,5) and (4,9)(4,9)', value: 'Determine the slope of the line passing through the points (2,5)(2,5) and (4,9)(4,9)' },
        { text: 'Calculate the result of (9+3)×4−7', value: 'Calculate the result of (9+3)×4−7' },
        { text: "What's the answer for (4.5*2.1)^2.2?", value: "What's the answer for (4.5*2.1)^2.2?" },
        { text: 'Find the mean height of students in centimeters: 160, 165, 170, 175, 180.', value: 'The heights (in centimeters) of students in a class are recorded as follows: 160, 165, 170, 175, 180. Find the mean height of the students.' }
    ];

    const handleButton2Click = () => {
        setStreamKey(prevKey => prevKey + 1);
        setOutput('');
        setRenderAnswer(true);
        setSelectedButton('button2');
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        eventSourceRef.current = streamData(mathProblem);
    };

    const handleCloseEvent = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            console.log('EventSource closed');
        }
    };

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
                console.log('EventSource closed');
            }
        };
    }, []);

    return (
        <div className={styles.App}>
            <MathFormatProfessionalFilled fontSize={'6rem'} primaryFill={'#8A0B31'} aria-hidden='true' aria-label='Supported File Types' />
            <h1 className={styles.title}>{t('mathAssistantTitle')}</h1>
            <span className={styles.chatEmptyObjectives}>
                <i className={styles.centered}>{t('transparencyNote')}</i>{' '}
                <a href='https://github.com/microsoft/PubSec-Info-Assistant/blob/main/docs/transparency.md' target='_blank' rel='noopener noreferrer'>
                    {t('transparencyLink')}
                </a>
            </span>
            <div className={styles.centeredContainer}>
                <p>{t('selectExample')}</p>
                <div>
                    <ul className={estyles.examplesNavList}>
                        {EXAMPLES.map((x, i) => (
                            <li key={i}>
                                <Example text={x.text} value={x.value} onClick={handleExampleClick} />
                            </li>
                        ))}
                    </ul>
                </div>
                <form className={styles.formClass} onSubmit={handleInput}>
                    <p className={styles.inputLabel}>{t('inputLabel')}</p>
                    <input
                        className={styles.inputField}
                        type='text'
                        value={mathProblem}
                        onChange={e => setMathProblem(e.target.value)}
                        placeholder={t('inputLabel')}
                    />
                    <div className={styles.buttonContainer}>
                        <Button
                            variant='secondary'
                            className={selectedButton === 'button1' ? styles.selectedButton : ''}
                            onClick={() => {
                                setSelectedButton('button1');
                                hinter(mathProblem);
                            }}
                        >
                            {ButtonValues.Clues}
                        </Button>
                        <Button
                            variant='secondary'
                            className={selectedButton === 'button2' ? styles.selectedButton : ''}
                            onClick={() => {
                                setSelectedButton('button2');
                                handleButton2Click();
                            }}
                        >
                            {ButtonValues.Solve}
                        </Button>
                        <Button
                            variant='secondary'
                            className={selectedButton === 'button3' ? styles.selectedButton : ''}
                            onClick={() => {
                                setSelectedButton('button3');
                                getAnswer(mathProblem);
                            }}
                        >
                            {ButtonValues.Answer}
                        </Button>
                    </div>
                </form>
                {error && <div className='spinner'>{errorMessage}</div>}
                {renderAnswer && !error && <CharacterStreamer key={streamKey} eventSource={eventSourceRef.current} onStreamingComplete={handleCloseEvent} classNames={styles.centeredAnswerContainer} nonEventString={output} />}
            </div>
        </div>
    );
};

export default Tutor;
