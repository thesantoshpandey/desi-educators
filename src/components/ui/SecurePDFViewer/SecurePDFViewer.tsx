'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import styles from './PDFViewer.module.css';

// Worker setup for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface SecurePDFViewerProps {
    fileId: string; // The ID in the secure bucket
}

export const SecurePDFViewer = ({ fileId }: SecurePDFViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    // Secure URL that calls our API
    const pdfUrl = `/api/secure/stream/${fileId}`;

    return (
        <div
            className={styles.viewerContainer}
            onContextMenu={(e) => e.preventDefault()} // Disable Right Click
        >
            {/* Protection Overlay */}
            <div className={styles.protectionLayer} />

            {/* Document Loader */}
            <div className={styles.documentWrapper}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className={styles.loader}>
                            <Loader2 className="animate-spin" /> Loading Protected Content...
                        </div>
                    }
                    error={<div className={styles.error}>Failed to load protected document.</div>}
                    noData={<div className={styles.error}>No document data found.</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        className={styles.pdfPage}
                        renderTextLayer={false} // Performance
                        renderAnnotationLayer={false}
                        width={Math.min(window.innerWidth * 0.9, 800)}
                    />
                </Document>
            </div>

            {/* Controls */}
            {numPages > 0 && (
                <div className={styles.controls}>
                    <button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span>
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
