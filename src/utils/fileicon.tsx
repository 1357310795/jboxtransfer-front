import { getIcon } from 'material-file-icons';

interface FileIconProps {
    filename: string;
    [key: string]: any;
}
const FileIcon: React.FC<FileIconProps> = ({ filename, style, ...props }) =>  {
  return (
    <div>
        <div {...props} style={{...style}} dangerouslySetInnerHTML={{ __html: getIcon(filename).svg }}>

        </div>
    </div>
  );
}

export default FileIcon;