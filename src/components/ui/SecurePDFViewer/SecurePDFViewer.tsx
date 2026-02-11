'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import styles from './PDFViewer.module.css';

// Worker setup for react-pdf
// Use unpkg CDN to ensure consistent worker version loading across all browsers
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePDFViewerProps {
    fileId: string; // The ID in the secure bucket
}

export const SecurePDFViewer = ({ fileId }: SecurePDFViewerProps) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    function onDocumentLoadError(error: Error) {
        console.error('PDF Load Error:', error);
        setErrorMsg(error.message);
        setIsLoading(false);
    }

    // Secure URL that calls our API
    const pdfUrl = `/api/secure/stream/${fileId}`;

    // Block Keyboard Shortcuts (Print/Save) & Right Click Globally
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                alert('This content is protected.');
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu); // Global block

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div
            className={styles.viewerContainer}
            onContextMenu={(e) => e.preventDefault()} // Disable Right Click
        >
            {/* Protection Overlay - Intercepts all clicks due to pointer-events: auto */}
            <div
                className={styles.protectionLayer}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            />

            {/* Document Loader */}
            <div className={styles.documentWrapper}>
                <Document
                    file={{
                        url: pdfUrl,
                        withCredentials: true,
                    }}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className={styles.loader}>
                            <Loader2 className="animate-spin" /> Loading Protected Content...
                        </div>
                    }
                    error={
                        <div className={styles.error}>
                            <p>Failed to load protected document.</p>
                            {errorMsg && <p className="text-sm text-red-400 mt-2">Error: {errorMsg}</p>}
                        </div>
                    }
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
