import { mean, deviation } from 'd3';

import { dataTable } from '@/store/data-store';
import { settings } from '@/store/settings';
import { PlotData } from 'plotly.js';
import { PlotlyOptions } from '@/types/plots';

const multiGeneBarData = (
  accessions: string[],
  options: PlotlyOptions
): Partial<PlotData>[] => {
  const data: Partial<PlotData>[] = [];
  accessions.forEach((accession) => {
    const plotData = dataTable.getRowAsTree(accession) as any;

    const x: string[][] = [[], []];
    const y: number[] = [];
    const error_y: number[] = [];
    settings.groupOrder.forEach((groupName) => {
      settings.sampleOrder.forEach((sampleName) => {
        const groupSamplePlotData = plotData[groupName][sampleName];
        if (groupSamplePlotData) {
          x[0].push(groupName);
          x[1].push(sampleName);
          y.push(mean(groupSamplePlotData) as number);
          error_y.push(deviation(groupSamplePlotData) as number);
        }
      });
    });
    data.push({
      x,
      y,
      error_y: { type: 'data', array: error_y, visible: true },
      type: 'bar',
      name: accession,
      showlegend: options.showlegend,
    });
  });

  return data;
};

export default multiGeneBarData;
