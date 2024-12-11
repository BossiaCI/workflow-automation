import { PDFViewer, Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer"
import { useMemo } from "react"

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf" },
    { 
      src: "https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf",
      fontWeight: "bold",
    },
  ],
})

interface PdfPreviewProps {
  layout: any
  formData: any
  fieldMappings: any[]
  previewData?: Record<string, any>
}

export function PdfPreview({ layout, formData, fieldMappings, previewData }: PdfPreviewProps) {
  const styles = useMemo(() => StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  element: {
    position: "absolute",
    maxWidth: "100%",
  },
  }), [])

  return (
    <PDFViewer className="w-full h-[600px]">
      <Document>
        <Page
          size={layout.settings.pageSize}
          orientation={layout.settings.orientation}
          style={[styles.page, { padding: layout.settings.margins.top }]}
        >
          {layout.elements.map((element) => {
            const baseStyle = {
              ...styles.element,
              left: element.position.x,
              top: element.position.y,
              ...element.style,
            }

            if (element.type === "field") {
              const field = formData.fields.find((f) => f.id === element.content)
              const mapping = fieldMappings.find((m) => m.fieldId === element.content)
              const value = previewData?.[element.content] || field?.label || ""
              
              const elementStyle = {
                ...baseStyle,
                ...(mapping && {
                  left: mapping.x,
                  top: mapping.y,
                  width: mapping.width,
                  fontSize: mapping.fontSize,
                  fontFamily: mapping.fontFamily,
                  textAlign: mapping.alignment,
                }),
              }
              
              return (
                <View
                  key={element.id}
                  style={elementStyle}
                >
                  <Text>{element.format ? element.format.replace("${value}", value) : value}</Text>
                </View>
              )
            }

            if (element.type === "image") {
              return (
                <Image
                  key={element.id}
                  style={elementStyle}
                  src={element.content}
                />
              )
            }

            return (
              <View
                key={element.id}
                style={baseStyle}
              >
                <Text>{element.content}</Text>
              </View>
            )
          })}
        </Page>
      </Document>
    </PDFViewer>
  )
}