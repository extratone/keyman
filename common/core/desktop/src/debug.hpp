/*
 * Keyman is copyright (C) SIL International. MIT License.
 *
 * Keyman Core - Debug class definition
 */

#pragma once

#include <cassert>
#include <vector>

#include <keyman/keyboardprocessor.h>
#include <keyman/keyboardprocessor_debug.h>

namespace km {
namespace kbp
{

class debug_items : public std::vector<km_kbp_state_debug_item>
{
private:
  bool _is_enabled;
public:
  template<typename... Args> debug_items(Args&&... args);
  void push_begin(km_kbp_state_debug_key_info *key_info, uint32_t flags);
  void push_end(uint32_t flags);
  void assert_push_entry();
  bool is_enabled() const noexcept;
  void set_enabled(bool value) noexcept;
};

template<typename... Args>
debug_items::debug_items(Args&&... args)
: std::vector<km_kbp_state_debug_item>(std::forward<Args>(args)...)
{
  // Ensure the debug_items list is terminated in case the client calls
  // km_kbp_state_debug_items before they call process_event.
  _is_enabled = false;
  push_end(0);
}

inline
void debug_items::assert_push_entry() {
  assert(empty() || (!empty() && back().type != KM_KBP_DEBUG_END));
}

inline
void debug_items::push_begin(km_kbp_state_debug_key_info *key_info, uint32_t flags) {
  assert_push_entry();
  emplace_back(km_kbp_state_debug_item{ KM_KBP_DEBUG_BEGIN, flags, {*key_info, } });
}

inline
void debug_items::push_end(uint32_t flags) {
  assert_push_entry();
  emplace_back(km_kbp_state_debug_item{ KM_KBP_DEBUG_END, flags, });
}

inline
bool debug_items::is_enabled() const noexcept {
  return _is_enabled;
}

inline
void debug_items::set_enabled(bool value) noexcept {
  _is_enabled = value;
}

} // namespace kbp
} // namespace km

