#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int _init(EVP_PKEY_CTX *ctx)

{
  int iVar1;
  
  iVar1 = 0x105018;
  if (true) {
    iVar1 = __gmon_start__();
  }
  return iVar1;
}

void FUN_00101020(void)

{
  (*(code *)(char *)0x0)();
  return;
}

void FUN_00101040(void)

{
  __cxa_finalize();
  return;
}

void processEntry _start(long long param_1,long long param_2)

{
  char auStack_8 [8];
  
  __libc_start_main(main,param_2,&stack0x00000008,0,0,param_1,auStack_8);
  do {
  } while( true );
}

void deregister_tm_clones(void)

{
  if ((false) && (true)) {
    _ITM_deregisterTMCloneTable();
    return;
  }
  return;
}

void register_tm_clones(void)

{
  if ((false) && (true)) {
    _ITM_registerTMCloneTable();
    return;
  }
  return;
}

void __do_global_dtors_aux(void)

{
  if (completed_0 == '\0') {
    if (true) {
      FUN_00101040(__dso_handle);
    }
    deregister_tm_clones();
    completed_0 = 1;
    return;
  }
  return;
}

long long main(void)

{
  if (false) {
    printf("Today is Saturday");
  }
  else if (false) {
    printf("Today is Sunday");
  }
  else {
    printf("Looking forward to the Weekend");
  }
  return 0;
}

void _fini(void)

{
  return;
}
