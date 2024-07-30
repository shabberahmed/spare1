import CopyWebpackPlugin from 'copy-webpack-plugin';
import { resolve } from 'path';

export default {
  // Other webpack configuration options
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(__dirname, 'package.json'),
          to: resolve(__dirname, 'dist'),
        },
      ],
    }),
  ],
};
