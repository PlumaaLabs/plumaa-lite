"use client";
import { pdfjs } from "react-pdf";
import { ComponentProps, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props extends ComponentProps<typeof Document> {
  page?: ComponentProps<typeof Page>;
}

function PDFDocument({ page, ...props }: Props) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  return (
    <>
      <Flex my="2">
        <Text>
          Página {pageNumber} de {numPages}
        </Text>
        <Button
          ml="5"
          size="1"
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          size="1"
          onClick={() => changePage(1)}
          disabled={pageNumber >= (numPages ?? 0)}
        >
          <ChevronRightIcon />
        </Button>
      </Flex>
      <Box
        style={{
          maxHeight: "800px",
        }}
      >
        <Document onLoadSuccess={onDocumentLoadSuccess} {...props}>
          <Page pageNumber={pageNumber} {...page} />
        </Document>
      </Box>
    </>
  );
}

export default PDFDocument;
