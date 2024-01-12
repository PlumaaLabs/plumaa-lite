import { Flex, Text } from "@radix-ui/themes";
import React, { ComponentProps, FC } from "react";
import { useDropzone } from "react-dropzone";
import { UploadIcon } from "@radix-ui/react-icons";

interface Props
  extends ReturnType<typeof useDropzone>,
    ComponentProps<typeof Flex> {
  text?: string;
  icon?: React.ReactNode;
}

const Dropzone: FC<Props> = ({
  getRootProps,
  getInputProps,
  text = "Suelta aquí tu archivo",
  style,
  icon = <UploadIcon height="30" width="30" />,
  isFocused,
  isFileDialogActive,
  isDragActive,
  isDragAccept,
  isDragReject,
  acceptedFiles,
  fileRejections,
  inputRef,
  rootRef,
  open,
  ...props
}) => {
  return (
    <Flex
      p="6"
      style={{
        border: "2px dashed",
        borderRadius: "8px",
        ...style,
      }}
      direction="column"
      align="center"
      justify="center"
      {...getRootProps({ className: "dropzone", ...props })}
    >
      <input {...getInputProps()} />
      {icon}
      <Text mt="4">{text}</Text>
    </Flex>
  );
};

export default Dropzone;
