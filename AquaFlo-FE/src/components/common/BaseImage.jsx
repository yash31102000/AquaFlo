import { resolveAssetPath } from "../../utils/ResolvePath";

const BaseImage = ({ src, alt = "", ...rest }) => {
    const resolvedSrc = resolveAssetPath(src);
    return <img src={resolvedSrc} alt={alt} {...rest} />;
};

export default BaseImage;