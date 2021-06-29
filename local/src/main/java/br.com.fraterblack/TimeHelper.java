package br.com.fraterblack;

public class TimeHelper {
    public static void setTimeout(Runnable runnable, Integer delay){
        new Thread(() -> {
            try {
                Thread.sleep(delay);
                runnable.run();
            }
            catch (Exception e){
                System.err.println(e);
            }
        }).start();
    }
}