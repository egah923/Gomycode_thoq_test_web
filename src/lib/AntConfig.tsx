import { ConfigProvider, message } from 'antd'
import React from 'react'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export const colorPrimary = "#FFDE2B";
const AntConfig = (props: { children: React.ReactNode | React.ReactElement }) => {
  const [, contextHolder] = message.useMessage();


  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colorPrimary,
          colorError: '#D85B3C',
          fontSize: 16,
          colorTextHeading: "#000000",
          colorText: "#3D3D3D",
          fontSizeHeading1: 42,
          fontSizeHeading2: 36,
          fontSizeHeading3: 32,
          fontSizeHeading4: 28,
          fontSizeHeading5: 24,
          fontFamily: poppins.className
        },
        components: {
          Button: {
            controlHeightSM: 36,
            controlHeightLG: 48,
            controlHeight: 42,
            borderRadiusLG: 15,
            borderRadiusSM: 4,
            fontWeight: 700,
            borderRadius: 4,
            fontSizeLG: 16,
            colorTextLightSolid: '#1D1D1D',
            defaultBg: '#D9D9D9'
          },
          Input: {
            controlHeightSM: 36,
            controlHeightLG: 48,
            controlHeight: 42,
            borderRadiusLG: 4,
            borderRadiusSM: 4,
            fontSizeLG: 16,
            borderRadius: 4,
            colorTextLabel: 'rgba(64, 69, 72, 1)',
            colorTextPlaceholder: 'rgba(64, 69, 72, 1)',
            fontWeightStrong: 700,
            colorBorder: 'rgba(232, 232, 244, 1)',
          },
          InputNumber: {
            controlHeightSM: 36,
            controlHeight: 42,
            controlHeightLG: 48,
            borderRadius: 8,
            colorTextPlaceholder: '#78756D',
            fontWeightStrong: 700,
            colorBorder: '#C3C2BE'
          },
          Divider: {
            colorSplit: 'rgb(195, 194, 190, 0.6)',
          },
          Select: {
            controlHeightSM: 36,
            controlHeight: 42,
            controlHeightLG: 48,
            borderRadius: 4,
            borderRadiusLG: 4,
            colorTextPlaceholder: '#B8B8C6',
            fontWeightStrong: 400,
            optionSelectedFontWeight: 400,
            colorBorder: 'rgba(232, 232, 244, 1)',
            optionActiveBg: '#fff',
            fontSize: 14,
          },
          DatePicker: {
            controlHeight: 50,
            borderRadius: 4,
            borderRadiusLG: 4,
            controlHeightLG: 50,
            colorTextPlaceholder: '#B8B8C6',
            fontWeightStrong: 400,
            colorBorder: '#000000',
            fontSize: 14,
            colorText: "#282518",
          },
          Rate: {
            marginXS: 4
          },
          Checkbox: {
            fontSize: 14,
            fontWeightStrong: 600,
          },
          Breadcrumb: {
            fontSize: 14,
            colorText: "#282518",
            fontWeightStrong: 500,
            colorPrimaryText: "#282518",
          },
          Tabs: {
            cardHeight: 30,
            fontSize: 16,
            fontWeightStrong: 600,
            colorBorderSecondary: "#251C0C",
            inkBarColor: "#ffffff",
            colorFillAlter: "#ffffff",
            colorBgContainer: "#FFF2CF",
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusOuter: 12,
            borderRadiusSM: 12,
            borderRadiusXS: 12,
            margin: 30,
            // horizontalItemGutter: 100
            horizontalItemGutter: 50,

          },
          Collapse: {
            colorBorder: "#C3C2BE"
          }
        },
      }}>
      {props.children}
      {contextHolder}
    </ConfigProvider>
  )
}

export default AntConfig