import React from 'react';

type Props = { title?: string; summary?: string };

export const CaseStudy: React.FC<Props> = ({ title = 'Case Study', summary }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold">{title}</div>
    {summary && <div>{summary}</div>}
  </div>
);

export default CaseStudy;
