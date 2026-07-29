
import { Button, Form, Modal, Space, Upload, UploadFile, message } from "antd";
import { RcFile, } from "antd/lib/upload";
import { useState } from "react";
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
const ShouldUpdateImage = ({ name, button, uploadClass, selectError, disabled }: any) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');




    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    return (
        <>
            <div className="w-100 text-center position-relative " >
                <Form.Item shouldUpdate={(prev: any, curr: any) => prev[name] !== curr[name]} className='mb-0 w-100'>
                    {({ getFieldValue, setFieldValue }) => {
                        let image = getFieldValue(name)

                        const beforeUpload = (file: RcFile) => {
                            const isValidType =
                                file.type === 'image/jpeg' ||
                                file.type === 'image/png' ||
                                file.type === 'image/webp';

                            if (!isValidType) {
                                message.error('You can only upload JPG, PNG, or WebP files!');
                                return Upload.LIST_IGNORE;
                            } else {
                                return isValidType;
                            }
                        };

                        return <Form.Item className='mt-5 w-100' name={name} >
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader position-relative"
                                fileList={[]}
                                disabled={disabled || false}
                                prefixCls="custom-upload w-75"
                                accept='image/png, image/jpeg, image/webp'
                                customRequest={({ onSuccess }: any) =>
                                    onSuccess("ok")
                                }
                                beforeUpload={beforeUpload}
                                onPreview={handlePreview}
                            >

                                {getFieldValue(name)?.fileList?.length ? <div className="selected-image-div w-100">
                                    <img src={image.fileList[0]?.originFileObj ? URL.createObjectURL(image.fileList[0]?.originFileObj) :
                                        image?.fileList[0]?.url} alt="" className=" w-100 object-fit-cover rounded-3 border-0" style={{ height: 120 }} />
                                    <Button type="text" className="icons-upload text-white" onClick={(e) => {
                                        e.stopPropagation()
                                    }} icon={<Space>
                                        <EyeOutlined onClick={() => {
                                            setPreviewImage(image.fileList[0]?.originFileObj ? URL.createObjectURL(image.fileList[0]?.originFileObj) :
                                                image?.fileList[0]?.url)
                                            setPreviewOpen(true)
                                        }} />
                                        <DeleteOutlined onClick={() => {
                                            setFieldValue(name, {
                                                fileList: []
                                            })
                                        }} />
                                    </Space>} />
                                </div> : button}
                            </Upload>
                        </Form.Item>
                    }}
                </Form.Item>

            </div>
            <Modal open={previewOpen} title={previewTitle} centered footer={null} onCancel={handleCancel} >
                <img loading="lazy" alt="example" style={{ width: '100%' }} src={previewImage} className="my-4" />
            </Modal>
        </>
    )
}

export default ShouldUpdateImage;