// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Text } from "@fluentui/react";
import { Options24Filled } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";

import styles from "./SettingsButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
}

export const SettingsButton = ({ className, onClick }: Props) => {
    const { t } = useTranslation();
    return (
        <div className={`${styles.container} ${className ?? ""}`} onClick={onClick}>
            <Options24Filled />
            <Text>{t("adjust")}</Text>
        </div>
    );
};
