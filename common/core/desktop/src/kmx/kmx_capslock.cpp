/*
  Copyright:        Copyright (C) 2003-2018 SIL International.
  Authors:          mcdurdin
*/
#include <kmx/kmx_processevent.h>

using namespace km::kbp;
using namespace kmx;

void KMX_ProcessEvent::ResetCapsLock(void)
{
  DebugLog("ResetCapsLock: enter");

  if (m_keyboard.Keyboard->dwFlags & KF_CAPSALWAYSOFF)
  {
    DebugLog("ResetCapsLock: caps lock should be always off");
    if (m_environment.capsLock())
    {
      DebugLog("ResetCapsLock: caps lock is on, switching off caps lock");
      m_actions.QueueAction(QIT_CAPSLOCK, 0);
    }
  }
  DebugLog("ResetCapsLock: exit");
}


void KMX_ProcessEvent::KeyCapsLockPress(KMX_BOOL FIsUp)
{
  if (m_keyboard.Keyboard->dwFlags & KF_CAPSONONLY)
  {
    if(FIsUp && !m_environment.capsLock())
    {
      m_actions.QueueAction(QIT_CAPSLOCK, 1);
    }
  }
  else if (m_keyboard.Keyboard->dwFlags & KF_CAPSALWAYSOFF)
  {
    if(!FIsUp && m_environment.capsLock())
    {
      m_actions.QueueAction(QIT_CAPSLOCK, 0);
    }
  }
}


void KMX_ProcessEvent::KeyShiftPress(KMX_BOOL FIsUp)
{
  if(!m_environment.capsLock()) return;

  if (m_keyboard.Keyboard->dwFlags & KF_SHIFTFREESCAPS)
  {
    if(!FIsUp)
    {
      m_actions.QueueAction(QIT_CAPSLOCK, 0);
    }
  }
}

