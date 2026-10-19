package auth_service.jwt;
import auth_service.entity.*; import auth_service.repository.UserRepository;
import io.jsonwebtoken.JwtException; import jakarta.servlet.*; import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List;
@Component @RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
 private final JwtService jwtService; private final UserRepository userRepository;
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
   String h=req.getHeader("Authorization");
   if(h==null||!h.startsWith("Bearer ")){chain.doFilter(req,res);return;}
   try{
     String token=h.substring(7); String email=jwtService.extractEmail(token);
     User u=userRepository.findByEmail(email).orElse(null);
     if(u!=null && u.getStatus()==UserStatus.ACTIVE && u.getRole()!=null && jwtService.isTokenValid(token,u)
       && SecurityContextHolder.getContext().getAuthentication()==null){
       var a=new UsernamePasswordAuthenticationToken(u,null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name())));
       SecurityContextHolder.getContext().setAuthentication(a);
     }
   }catch(JwtException|IllegalArgumentException ignored){}
   chain.doFilter(req,res);
 }
}
