declare module 'react-csv' {
  import React from 'react';
  
  interface CSVLinkProps {
    data: any[];
    headers?: Array<{label: string; key: string}>;
    filename?: string;
    className?: string;
    target?: string;
    children?: React.ReactNode;
  }
  
  export const CSVLink: React.FC<CSVLinkProps>;
}