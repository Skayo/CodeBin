<?php

require_once 'vendor/autoload.php';

session_start();

$provider = new League\OAuth2\Client\Provider\Github(require 'config.php');

// If we don't have an authorization code then get one
if (!isset($_GET['code'])) {

  // Fetch the authorization URL from the provider; this returns the
  // urlAuthorize option and generates and applies any necessary parameters
  // (e.g. state).
  $authorizationUrl = $provider->getAuthorizationUrl([
    'scope' => ['gist', 'user:email']
  ]);

  // Get the state generated for you and store it to the session.
  $_SESSION['oauth2state'] = $provider->getState();

  // Redirect the user to the authorization URL.
  header('Location: ' . $authorizationUrl);
  exit;

// Check given state against previously stored one to mitigate CSRF attack
} elseif (empty($_GET['state']) || (isset($_SESSION['oauth2state']) && $_GET['state'] !== $_SESSION['oauth2state'])) {

  if (isset($_SESSION['oauth2state'])) {
    unset($_SESSION['oauth2state']);
  }

  exit('Invalid state');

} else {

  try {

    // Try to get an access token using the authorization code grant.
    $accessToken = $provider->getAccessToken('authorization_code', [
      'code' => $_GET['code']
    ]);

    // Redirect to site
    header('Location: https://bin.skayo.dev/github_success?access_token=' . $accessToken->getToken());

  } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

    // Failed to get the access token or user details.
    exit($e->getMessage());

  }

}
