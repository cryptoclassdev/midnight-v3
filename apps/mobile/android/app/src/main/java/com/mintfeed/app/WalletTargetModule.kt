package com.mintfeed.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Minimal native module that lets JS specify which wallet app should
 * receive the next MWA (solana-wallet://) intent.
 *
 * MainActivity.startActivityForResult reads the static targetPackage
 * and calls intent.setPackage() so Android routes the MWA handshake
 * to the correct wallet instead of the system default.
 */
class WalletTargetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WalletTarget"

    @ReactMethod
    fun setTargetPackage(packageName: String?) {
        MainActivity.targetWalletPackage = packageName
    }
}
