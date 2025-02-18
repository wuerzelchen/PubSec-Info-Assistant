// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { CheckboxVisibility, DetailsList, DetailsListLayoutMode, IColumn, mergeStyles } from '@fluentui/react';
import classNames from "classnames";
import { nanoid } from "nanoid";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DropZone } from "./drop-zone"
import styles from "./file-picker.module.css";
import { FilesList } from "./files-list";
import cstyle from "./Tda.module.css"
import Papa from "papaparse";
import { postTd, processCsvAgentResponse, refresh, getTempImages, streamTdData, getMaxCSVFileSize, getMaxCSVFileSizeType } from "../../api";
import { Button } from 'react-bootstrap';
import estyles from "../../components/Example/Example.module.css";
import { Example } from "../../components/Example";
import { DocumentDataFilled, TableSearchFilled } from "@fluentui/react-icons";
import CharacterStreamer from '../../components/CharacterStreamer/CharacterStreamer';
import { useTranslation } from 'react-i18next';


interface Props {
  folderPath: string;
  tags: string[];
}

const Tda = ({ folderPath, tags }: Props) => {
  const { t } = useTranslation();
  const [streamKey, setStreamKey] = useState(0);
  const [files, setFiles] = useState<any>([]);
  const [progress, setProgress] = useState(0);
  const [uploadStarted, setUploadStarted] = useState(false);
  const folderName = folderPath;
  const tagList = tags;
  const [fileUploaded, setFileUploaded] = useState(false);
  const [output, setOutput] = useState('');
  const [otherq, setOtherq] = useState('');
  const [selectedQuery, setSelectedQuery] = useState('');
  const [dataFrame, setDataFrame] = useState<object[]>([]);
  const [renderAnswer, setRenderAnswer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [fileu, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [maxCSVFileSize, setMaxCSVFileSize] = useState<getMaxCSVFileSizeType | null>(null);


  type ExampleModel = {
    text: string;
    value: string;
  };

  const EXAMPLES: ExampleModel[] = [
    { text: t('tdaExamples.0'), value: t('tdaExamples.0') },
    { text: t('tdaExamples.1'), value: t('tdaExamples.1') },
    { text: t('tdaExamples.2'), value: t('tdaExamples.2') },
    { text: t('tdaExamples.3'), value: t('tdaExamples.3') }
  ];

  interface Props {
    onExampleClicked: (value: string) => void;
  }

  const fetchImages = async () => {
    console.log('fetchImages called');
    const tempImages = await getTempImages();
    console.log('tempImages:', tempImages);
    setImages(tempImages);
    console.log('images:', images);
  };
  const setOtherQ = (selectedQuery: string) => {
    if (inputValue != "") {
      return inputValue;
    }
    return selectedQuery;
  };

  const handleAnalysis = () => {
    setImages([])
    setOutput('');
    setRenderAnswer(true);
    setTimeout(async () => {
      try {
        const query = setOtherQ(selectedQuery);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        if (fileu) {
          eventSourceRef.current = await streamTdData(query, fileu);
          console.log('EventSource opened');
          console.log(eventSourceRef.current);
          setStreamKey(prevKey => prevKey + 1);
        } else {
          setOutput("no file file has been uploaded.")
        }
      } catch (error) {
        console.log(error);
        setRenderAnswer(false);
      }
    }, 0);
  };

  // Handle the analysis here


  const handleAnswer = async () => {
    setStreamKey(prevKey => prevKey + 1);
    let lastError;
    const retries: number = 3;
    for (let i = 0; i < retries; i++) {
      try {
        setImages([])
        const query = setOtherQ(selectedQuery);
        setOutput('');
        setRenderAnswer(true);
        if (fileu) {
          const result = await processCsvAgentResponse(query, fileu);
          setOutput(result.toString());
          fetchImages();
          return;

        }
        else {
          setOutput("no file file has been uploaded.")
        }
      } catch (error) {
        lastError = error;
      }
    }
    // If the code reaches here, all retries have failed. Handle the error as needed.
    console.error(lastError);
    setOutput('An error occurred.');
  };

  // handler called when files are selected via the Dropzone component

  const handleQueryChange = (value: string) => {
    setInputValue(value);
    setSelectedQuery(value);
    // Handle the selected query here
  };

  const handleOnChange = useCallback((files: any) => {
    let filesArray = Array.from(files);

    filesArray = filesArray.filter((file: any) => file.type === 'text/csv');

    filesArray = filesArray.map((file: any) => ({
      id: nanoid(),
      file
    }));

    setFiles(filesArray as any);
    setProgress(0);
    setUploadStarted(false);
  }, []);

  useEffect(() => {
    const fetchMaxCSVFileSize = async () => {
      const size = await getMaxCSVFileSize();
      console.log(size.MAX_CSV_FILE_SIZE)
      setMaxCSVFileSize(size);
    };

    fetchMaxCSVFileSize();
  }, []);
  // handle for removing files form the files list view
  const handleClearFile = useCallback((id: any) => {
    setFiles((prev: any) => prev.filter((file: any) => file.id !== id));
  }, []);

  // whether to show the progress bar or not
  const canShowProgress = useMemo(() => files.length > 0, [files.length]);
  const MAX_CSV_FILE_SIZE = Number(maxCSVFileSize?.MAX_CSV_FILE_SIZE) * 1024 * 1024; // 5 MB default

  // execute the upload operation
  const handleUpload = useCallback(async () => {
    try {
      setFile(null);
      const data = new FormData();
      console.log("files", files);
      setUploadStarted(true);
      files.forEach(async (indexedFile: any) => {
        var file = indexedFile.file as File;
        console.log('MAX_CSV_FILE_SIZE:', MAX_CSV_FILE_SIZE);
        if (file.size > MAX_CSV_FILE_SIZE) {
          alert(`File is too large. Please upload a file smaller than ${maxCSVFileSize?.MAX_CSV_FILE_SIZE} MB.`);
          setUploadStarted(false);
          return;
        }
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          complete: async function (results) {
            data.append("file", file);
            console.log("Finished:", results.data);
            // Here, results.data is your dataframe
            // You can set it in your state like this:
            setDataFrame(results.data as object[]);
            try {
              const response = await postTd(file).then((response) => {
                setProgress(100);
                setFileUploaded(true);
                console.log('Response from server:', response);
              }).catch((error) => { console.log(error); });

            } catch (error) {
              console.error('Error posting CSV:', error);
            }
          }
        });
        setFile(file)
      });
    } catch (error) {
      console.error('Error uploading files: ', error);
    }

  }, [files]);

  // set progress to zero when there are no files
  useEffect(() => {
    if (files.length < 1) {
      setProgress(0);
    }
  }, [files.length]);

  // set uploadStarted to false when the upload is complete
  useEffect(() => {
    if (progress === 100) {
      setUploadStarted(false);
    }
  }, [progress]);


  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      // Skip the effect on the first render
      firstRender.current = false;
    } else {
      if (fileu) {
        handleAnswer();
      }
      else {
        setOutput("no file file has been uploaded.")
      }
    }
  }, [selectedQuery]);
  let indexLength = 0;
  if (dataFrame.length > 0) {
    for (let i = 0; i < dataFrame.length; i++) {
      const length = String(i).length;
      if (length > indexLength) {
        indexLength = length;
      }
    }
  }

  const handleCloseEvent = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      fetchImages();
      console.log('EventSource closed');
    }
  }


  const columnLengths: { [key: string]: number } = dataFrame.reduce((lengths: { [key: string]: number }, row: Record<string, any>) => {
    Object.keys(row).forEach((key) => {
      const valueLength = Math.max(String(row[key]).length, key.length);
      if (!lengths[key] || valueLength > lengths[key]) {
        lengths[key] = valueLength;
      }
    });
    return lengths;
  }, Object.keys(dataFrame[0] || {}).reduce((lengths: { [key: string]: number }, key: string) => {
    lengths[key] = key.length;
    return lengths;
  }, {} as { [key: string]: number }));
  const columns: IColumn[] = [
    {
      key: 'index',
      name: '',
      fieldName: 'index',
      minWidth: indexLength * 8,
      maxWidth: indexLength * 8,
      isResizable: true,
    },
    // Add more columns dynamically based on the dataFrame
    ...Object.keys(dataFrame[0] || {}).map((key) => ({
      key,
      name: key,
      fieldName: key,
      minWidth: columnLengths[key] * 8,
      maxWidth: columnLengths[key] * 8,
      isResizable: true,
    })),
  ];

  const items = dataFrame.map((row, index) => ({ index, ...row }));

  const uploadComplete = useMemo(() => progress === 100, [progress]);


  return (<div className={cstyle.contentArea} >
    <div className={cstyle.App} >
      <TableSearchFilled fontSize={"6rem"} primaryFill={"#7719aa"} aria-hidden="true" aria-label={t('supportedFileTypes')} />
      <h1 className={cstyle.EmptyStateTitle}>{t('tabularDataAssistant')}</h1>
      <span className={styles.chatEmptyObjectives}>
        <i className={cstyle.centertext}>{t('informationAssistantUsesAI')}</i> <a href="https://github.com/microsoft/PubSec-Info-Assistant/blob/main/docs/transparency.md" target="_blank" rel="noopener noreferrer"> {t('transparencyNote')}</a>
      </span>


      <div className={cstyle.centeredContainer}>
        <h2 className={styles.EmptyStateTitle}>{t('supportedFileTypes')}</h2>


        <DocumentDataFilled fontSize={"40px"} primaryFill={"#7719aa"} aria-hidden="true" aria-label={t('data')} />
        <span className={cstyle.EmptyObjectivesListItemText}><b>{t('data')}</b><br />
          csv<br />
        </span>
        <span className={cstyle.EmptyObjectivesListItemText}>
          {t('maxFileSize')}: {maxCSVFileSize?.MAX_CSV_FILE_SIZE} MB
        </span>
        <br />
        <div className={styles.wrapper}>

          {/* canvas */}
          <div className={styles.canvas_wrapper}>
            <DropZone onChange={handleOnChange} accept={files} />
          </div>

          {/* files listing */}
          {files.length ? (
            <div className={styles.files_list_wrapper}>
              <FilesList
                files={files}
                onClear={handleClearFile}
                uploadComplete={uploadComplete}
              />
            </div>
          ) : null}

          {/* progress bar */}
          {canShowProgress ? (
            <div className={styles.files_list_progress_wrapper}>
              <progress value={progress} max={100} style={{ width: "100%" }} />
            </div>
          ) : null}

          {/* upload button */}
          {files.length ? (
            <button
              onClick={handleUpload}
              className={classNames(
                styles.upload_button,
                uploadComplete || uploadStarted ? styles.disabled : ""
              )}
              aria-label={t('uploadFiles')}
            >
              {t('uploadFiles', { count: files.length })}
            </button>
          ) : null}
        </div>

        <p>{t('selectExampleQuery')}:</p>
        <div >
          <ul className={estyles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
              <li key={i}>
                <Example text={x.text} value={x.value} onClick={handleQueryChange} />
              </li>
            ))}
          </ul>
          <div >

            <br></br>
            <p>{t('askQuestionAboutCSV')}:</p>
            <input
              className={cstyle.inputField}
              type="text"
              placeholder={t('enterYourQuery')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className={cstyle.buttonContainer}>
              <Button variant="secondary" onClick={handleAnalysis}>{t('hereIsMyAnalysis')}</Button>
              <Button variant="secondary" onClick={handleAnswer}>{t('showMeTheAnswer')}</Button>
            </div>
            {(
              <div style={{ width: '100%' }}>
                <h2>{t('tabularDataAssistantResponse')}:</h2>
                <div>
                  {renderAnswer &&
                    <CharacterStreamer key={streamKey} eventSource={eventSourceRef.current} classNames={cstyle.centeredAnswerContainer} nonEventString={output} onStreamingComplete={handleCloseEvent} typingSpeed={10} />}
                </div>
                <h2>{t('generatedImages')}:</h2>
                <div>
                  {images.length > 0 ? (
                    images.map((image, index) => (
                      <img
                        key={index}
                        src={`data:image/png;base64,${image}`}
                        alt={t('tempImage', { index })}
                        style={{ maxWidth: '100%' }}
                      />
                    ))
                  ) : (
                    <p>{t('noImagesGenerated')}</p>
                  )}
                </div>
                <div className={cstyle.raiwarning}>{t('aiGeneratedContentWarning')}</div>

              </div>
            )}
          </div>
        </div>


      </div>

      <div className={cstyle.centeredContainer}>
        <details style={{ width: '100%' }}>
          <summary>{t('seeDataframe')}</summary>
          <div style={{ width: '100%', height: '500px', overflow: 'auto', direction: 'rtl' }}>
            <div style={{ direction: 'ltr' }}>
              <DetailsList
                items={items}
                className={cstyle.mydetailslist}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selectionPreservedOnEmptyClick={true}
                checkboxVisibility={CheckboxVisibility.hidden}
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
  );
};

export { Tda };
