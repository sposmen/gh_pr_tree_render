import React from 'react';
import {
  Panel,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from '@xyflow/react';
import { toSvg } from 'html-to-image';
import { Download } from 'react-bootstrap-icons';

const imageWidth = 1024;
const imageHeight = 1500;

function DownloadButton({fileNameBase}) {
  const { getNodes } = useReactFlow();
  const downloadImage = (dataUrl) => {
    const a = document.createElement('a');

    a.setAttribute('download', `${fileNameBase}.svg`);
    a.setAttribute('href', dataUrl);
    a.click();
  }

  const onClick = () => {
    const container = document.querySelector('.react-flow__viewport')
    const width = container.offsetWidth
    const height = container.offsetHeight
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    );

    toSvg(container, {
      backgroundColor: '#fff',
      width: width,
      height: height,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Panel position="top-right">
      <button className="download-btn" onClick={onClick}>
        Download Image <Download />
      </button>
    </Panel>
  );
}

export default DownloadButton;
