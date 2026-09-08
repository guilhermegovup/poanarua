import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { COLORS } from '~/styles';
import { openUrl, parseHtml } from '~/utils';

interface Props {
  html: string;
  style?: TextStyle;
}

/** Renderiza a descrição HTML dos eventos sem depender de um WebView. */
export function HtmlText({ html, style }: Props) {
  const blocks = parseHtml(html);

  return (
    <>
      {blocks.map((block, blockIndex) => (
        <Text key={`block-${blockIndex}`} style={[styles.paragraph, style]}>
          {block.segments.map((segment, index) => (
            <Text
              key={`segment-${blockIndex}-${index}`}
              onPress={segment.href ? () => openUrl(segment.href!) : undefined}
              style={[
                segment.bold ? styles.bold : null,
                segment.italic ? styles.italic : null,
                segment.href ? styles.link : null,
              ]}
            >
              {segment.text}
            </Text>
          ))}
        </Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  link: { color: COLORS.BLUE, textDecorationLine: 'underline' },
  paragraph: {
    color: COLORS.BLACK,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
});

export default HtmlText;
