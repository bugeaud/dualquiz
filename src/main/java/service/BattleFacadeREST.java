package service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import net.java.dualquizz.model.Battle;
import net.java.dualquizz.model.Player;


/**
 * Battle REST Service
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Stateless
@Path("net.java.dualquizz.battle")
public class BattleFacadeREST extends AbstractFacade<Battle> {
    @PersistenceContext(unitName = "net.java.dualquizz_dualquiz_war_0.1-PU")
    private EntityManager em;

    public BattleFacadeREST() {
        super(Battle.class);
    }

    @POST
    @Override
    @Consumes({"application/xml", "application/json"})
    public void create(Battle entity) {
        super.create(entity);
    }

    @GET
    @Path("new-battle")
    @Produces({"application/json", "application/xml"})
    public Battle newBattle(@QueryParam("cid") List<Integer> playerIds, @QueryParam("category") String category) {
        if(playerIds==null || playerIds.size()<2){
            // There can only be a battle with at lease two supposed playser
            return null;
        }
        final List<Integer> confirmedContenderIds = playerIds.stream()
                    .filter(p -> playerService.find(p)!=null )
                    .collect(Collectors.toList());  
        
        // Let's create an empty battle
        final Battle battle = new Battle();
        // Fill in the board according to the confirmed contenders
        Map<Integer, Integer> map = confirmedContenderIds.stream()
                                    .collect(Collectors.toMap(Function.identity(),
                                                              (p) -> 0));
                
        battle.setBoardMembers(map);
        battle.setCategory(category);
        super.create(battle);
        return battle;
    }
    
    
    @PUT
    @Path("{id}")
    @Consumes({"application/xml", "application/json"})
    public void edit(@PathParam("id") String id, Battle entity) {
        super.edit(entity);
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") String id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({"application/xml", "application/json"})
    public Battle find(@PathParam("id") String id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({"application/xml", "application/json"})
    public List<Battle> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({"application/xml", "application/json"})
    public List<Battle> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces("text/plain")
    public String countREST() {
        return String.valueOf(super.count());
    }

    @EJB PlayerFacadeREST playerService;
    @EJB QuestionFacadeREST questionService;
        
    @GET
    @Path("new-answer/{battleId}/{playerId}/{questionId}/{proposalId}")
    @Produces({"application/xml", "application/json"})
    public Battle correctAnswer(@PathParam("id") String id,
                                @PathParam("battleId") String battleId,
                                @PathParam("playerId") Integer playerId,
                                @PathParam("questionId") String questionId,
                                @PathParam("proposalId") String proposalId) {
        Battle battle = find(id);
        if(battle==null){
            // Not even the battle identifier is fine, no chance to perform the request
            return null;
        }
        if(!questionService.isCorrecAnswer(questionId, proposalId)){
            // This is a wrong request simply ignore it
            return battle;
        }
        // check that the provided using is existing
        final Map<Integer, Integer> board = battle.getBoardMembers();
        if(!board.containsKey(playerId)){
            // nobody was found, we sillently ignore the mistake
            return battle;
        }
        // Everything is fine, let's give the reward
        board.put(playerId, board.get(playerId) + 1);
                
        return battle;
    }
  

    
    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
