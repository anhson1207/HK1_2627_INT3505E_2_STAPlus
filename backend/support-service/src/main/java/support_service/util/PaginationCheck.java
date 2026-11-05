package support_service.util;

public class PaginationCheck {
    public static int[] check(Integer pgNum, Integer pgSize) {
        int page = (pgNum == null || pgNum < 0) ? 0 : pgNum;
        int size = (pgSize == null || pgSize <= 0) ? 10 : Math.min(pgSize, 100);
        return new int[]{page, size};
    }
}

