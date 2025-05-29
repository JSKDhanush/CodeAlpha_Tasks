import React, { useEffect, useState } from "react";
import styles from "./PopupMessage.module.css";

interface PopupMessageProps {
    message: string;
    onClose: () => void;
    type: string;
    onConfirm?: () => void;
}

const PopupMessage: React.FC<PopupMessageProps> = ({
    message,
    onClose,
    type,
    onConfirm,
}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (type !== "confirmation") {
            const timer = setTimeout(() => {
                setVisible(false);
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [onClose, type]);

    if (!visible) return null;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        setVisible(false);
        onClose();
    };

    return (
        <div className={`${styles.popupOverlay} ${type === "confirmation" ? styles.centerOverlay : ""}`}>
            
            <div className={styles.popupContainer}>
                
                <div className={styles.closeButton} onClick={onClose}>
                    <div className={styles.closeButtonicon}><svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="red"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg></div>
                    <div className={styles.closeButtonclose}><svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="white"
                    >
                        <path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z" />
                    </svg></div>
                </div>

                <div
                    className={`${styles.popupHeader} ${type === "success"
                        ? styles.successBg
                        : type === "error"
                            ? styles.errorBg
                            : type === "info"
                                ? styles.infoBg
                                : styles.confirmationBg
                        }`}
                >
                    <div className={styles.iconMessageContainer}>
                        {type === "success" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#4CAF50"
                            >
                                <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                            </svg>
                        ) : type === "error" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#F44336"
                            >
                                <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                            </svg>
                        ) : type === "info" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#FFC107"
                            >
                                <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                            </svg>
                        ) : (
                            ""
                        )}
                        <p className={styles.messageText}>{message}</p>
                    </div>
                    {type === "confirmation" && (
                        <div className={styles.confirmationButtons}>
                            <button
                                className={styles.confirmButton}
                                onClick={handleConfirm}
                            >
                                OK
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    {type !== "confirmation" && <div className={styles.progressBar}></div>}
                </div>
            </div>
        </div>
    );
};

export default PopupMessage;