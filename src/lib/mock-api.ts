import JSZip from 'jszip';

const MOCK_CLEANED_CSV_CONTENT = `id,name,age,city,occupation
1,John Doe,28,New York,Engineer
2,Jane Smith,34,London,Designer
3,Sam Wilson,34,Tokyo,Developer
4,Alice Johnson,45,Sydney,Manager
5,Bob Brown,23,Paris,Student
6,Charlie Black,34,New York,Engineer
7,Diana Prince,29,London,Artist
8,Peter Parker,22,New York,Photographer
9,Bruce Wayne,40,Gotham,CEO
10,Clark Kent,35,Metropolis,Journalist
`;

const MOCK_EDA_HTML_CONTENT = `
  <h1>EDA Report: Cleaned Customer Dataset</h1>
  <p>This report provides an exploratory data analysis of the processed customer dataset. It covers key aspects such as data quality, distributions, and relationships between variables.</p>
  
  <h2>Dataset Overview</h2>
  <blockquote>This dataset contains 10 rows and 5 columns, detailing customer information including their age, city, and occupation. All missing values have been handled.</blockquote>
  
  <h2>Visualizations</h2>
  <h3>Age Distribution (Cleaned)</h3>
  <p>A histogram of the 'Age' column reveals the age distribution of customers. Most customers are in their late 20s to mid-30s. Missing ages were imputed with the mean.</p>
  <img src="https://placehold.co/600x400.png" data-ai-hint="bar chart" alt="Age Distribution Histogram" />
  
  <h3>Occupation by City (Cleaned)</h3>
  <p>This chart illustrates the distribution of various occupations across different cities. Missing occupations were imputed with the mode.</p>
  <img src="https://placehold.co/600x400.png" data-ai-hint="data visualization" alt="Occupation by City" />
`;

export const fetchProcessedDataZip = async (): Promise<Blob> => {
  const zip = new JSZip();
  zip.file('cleaned_dataset.csv', MOCK_CLEANED_CSV_CONTENT);
  zip.file('eda_report.html', MOCK_EDA_HTML_CONTENT);
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
};
