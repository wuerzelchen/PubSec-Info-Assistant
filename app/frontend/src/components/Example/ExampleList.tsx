// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Example } from "./Example";
import { useTranslation } from 'react-i18next';

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    const { t } = useTranslation();

    const EXAMPLES: ExampleModel[] = [
        { text: t('examples.0'), value: t('examples.0') },
        { text: t('examples.1'), value: t('examples.1') },
        { text: t('examples.2'), value: t('examples.2') }
    ];

    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
