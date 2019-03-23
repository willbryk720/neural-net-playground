import React, { Component } from "react";

export const explanations = {
  dense: (
    <div>
      <div>A dense layer is simply a fully connected layer</div>
      <br />
      <b>Options:</b>
      <ul>
        <li>units: the number of neurons in the layer </li>
        <li>activation: the activation function for the network </li>
      </ul>
      <div style={{ width: "100%" }}>
        <img src="https://slugnet.jarrodkahn.com/_images/tikz-be0593f4dad31d763e7f8371668007610e7907c1.png" />
      </div>
      <div className="youtube-container">
        <iframe
          className="youtube-embed"
          src="https://www.youtube.com/watch?v=FK77zZxaBoI"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </div>
  ),

  conv2d: (
    <div>
      <div>A convolutional layer slides a filter or kernel over the previous layer </div>
      <br />
      <b>Options:</b>
      <ul>
        <li>kernelSize: the size of the kernel </li>
        <li>filters: the number of filters </li>
        <li>activation: the activation function for the network </li>
      </ul>
      <div>
        <img
          src="https://anhvnn.files.wordpress.com/2018/02/convolve.png"
          style={{ width: "100%" }}
        />
      </div>
      <div className="youtube-container">
        <iframe
          className="youtube-embed"
          src="https://www.youtube.com/watch?v=RCw530Emvks"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </div>
  ),

  maxPooling2d: (
    <div>
      <div>A maxPooling2d layer is a layer that reduces the size of the input using maxpooling</div>
      <br />
      <b>Options:</b>
      <ul>
        <li>poolSize: the side length of the pooling window </li>
        <li>Strides: the spacing between pooling windows </li>
      </ul>

      <div style={{ width: "100%" }}>
        <img src="https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwjN6YO9zpfhAhUDmeAKHT9QB4IQjRx6BAgBEAU&url=https%3A%2F%2Fwww.quora.com%2FWhat-is-max-pooling-in-convolutional-neural-networks&psig=AOvVaw16lp69YFIvhRlXza-9z5Zb&ust=1553408152807173" />
      </div>
      {/* <div className="youtube-container">
        <iframe
          className="youtube-embed"
          src="https://www.youtube.com/watch?v=FK77zZxaBoI"
          allowFullScreen
          frameBorder="0"
        />
      </div> */}
    </div>
  ),
  flatten: (
    <div>
      <p>A Flatten layer converts a multidimensional tensor of neurons into a 1d row of neurons</p>{" "}
      <p>There are no options to choose for Flatten</p>
      <div style={{ width: "100%" }}>
        <img src="https://sds-platform-private.s3-us-east-2.amazonaws.com/uploads/73_blog_image_2.png" />
      </div>
    </div>
  )
};
