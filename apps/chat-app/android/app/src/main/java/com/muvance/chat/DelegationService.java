package com.muvance.chat;

/**
 * Lets Chrome hand the site's notifications (and Android 13's notification permission) to the app,
 * so new messages show with Muvance Chat's name and icon.
 */
public class DelegationService extends com.google.androidbrowserhelper.trusted.DelegationService {
}
